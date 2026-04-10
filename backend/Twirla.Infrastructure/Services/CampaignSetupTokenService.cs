using System.Security.Cryptography;
using System.Text;
using Microsoft.Extensions.Configuration;

namespace Twirla.Infrastructure.Services;

/// <summary>
/// Validates the campaign setup access code and issues short-lived HMAC-signed session tokens.
/// Configure <c>CampaignSetup:AccessCode</c> or env <c>TWIRLA_CAMPAIGN_SETUP_ACCESS_CODE</c>.
/// Optional <c>CampaignSetup:SessionSigningKey</c> / <c>TWIRLA_CAMPAIGN_SETUP_SESSION_KEY</c> to sign sessions independently of the access code.
/// </summary>
public class CampaignSetupTokenService
{
    private readonly IConfiguration _configuration;

    public CampaignSetupTokenService(IConfiguration configuration)
    {
        _configuration = configuration;
    }

    public string? GetAccessCode()
    {
        var raw =
            Environment.GetEnvironmentVariable("TWIRLA_CAMPAIGN_SETUP_ACCESS_CODE")
            ?? _configuration["CampaignSetup:AccessCode"];
        return string.IsNullOrWhiteSpace(raw) ? null : raw.Trim();
    }

    public string? GetSessionSigningKey()
    {
        var raw =
            Environment.GetEnvironmentVariable("TWIRLA_CAMPAIGN_SETUP_SESSION_KEY")
            ?? _configuration["CampaignSetup:SessionSigningKey"];
        return string.IsNullOrWhiteSpace(raw) ? null : raw.Trim();
    }

    public bool IsAccessCodeConfigured() => !string.IsNullOrEmpty(GetAccessCode());

    public bool ValidateAccessCode(string? provided)
    {
        var expected = GetAccessCode();
        if (string.IsNullOrEmpty(expected) || string.IsNullOrEmpty(provided))
            return false;

        var p = provided.Trim();
        var he = SHA256.HashData(Encoding.UTF8.GetBytes(expected));
        var hp = SHA256.HashData(Encoding.UTF8.GetBytes(p));
        return CryptographicOperations.FixedTimeEquals(he, hp);
    }

    private byte[] GetSigningKeyMaterial()
    {
        var sk = GetSessionSigningKey();
        if (!string.IsNullOrEmpty(sk))
            return SHA256.HashData(Encoding.UTF8.GetBytes(sk));

        var ac = GetAccessCode();
        if (string.IsNullOrEmpty(ac))
            return Array.Empty<byte>();

        return SHA256.HashData(Encoding.UTF8.GetBytes("twirla.campaign.session.v1|" + ac));
    }

    public bool TryCreateSessionToken(out string token, out int expiresInSeconds)
    {
        expiresInSeconds = 8 * 3600;
        token = string.Empty;
        var key = GetSigningKeyMaterial();
        if (key.Length == 0)
            return false;

        var exp = DateTimeOffset.UtcNow.AddSeconds(expiresInSeconds).ToUnixTimeSeconds();
        var nonce = Convert.ToHexString(RandomNumberGenerator.GetBytes(8)).ToLowerInvariant();
        var payload = $"{exp}.{nonce}";
        var payloadBytes = Encoding.UTF8.GetBytes(payload);
        using var hmac = new HMACSHA256(key);
        var sig = hmac.ComputeHash(payloadBytes);
        token = $"{Base64UrlEncode(payloadBytes)}.{Base64UrlEncode(sig)}";
        return true;
    }

    public bool ValidateSessionToken(string? token)
    {
        if (string.IsNullOrWhiteSpace(token))
            return false;

        var dot = token.IndexOf('.');
        if (dot <= 0 || dot >= token.Length - 1)
            return false;

        try
        {
            var payloadBytes = Base64UrlDecode(token[..dot]);
            var sigGiven = Base64UrlDecode(token[(dot + 1)..]);
            var key = GetSigningKeyMaterial();
            if (key.Length == 0)
                return false;

            using var hmac = new HMACSHA256(key);
            var expectedSig = hmac.ComputeHash(payloadBytes);
            if (!CryptographicOperations.FixedTimeEquals(expectedSig, sigGiven))
                return false;

            var payload = Encoding.UTF8.GetString(payloadBytes);
            var expSep = payload.IndexOf('.');
            if (expSep <= 0)
                return false;

            if (!long.TryParse(payload[..expSep], out var expUnix))
                return false;

            if (DateTimeOffset.UtcNow.ToUnixTimeSeconds() > expUnix)
                return false;

            return true;
        }
        catch
        {
            return false;
        }
    }

    private static string Base64UrlEncode(byte[] data) =>
        Convert.ToBase64String(data).TrimEnd('=').Replace('+', '-').Replace('/', '_');

    private static byte[] Base64UrlDecode(string s)
    {
        var padded = s.Replace('-', '+').Replace('_', '/');
        switch (padded.Length % 4)
        {
            case 2: padded += "=="; break;
            case 3: padded += "="; break;
        }

        return Convert.FromBase64String(padded);
    }
}
