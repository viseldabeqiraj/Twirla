using Microsoft.AspNetCore.Mvc;
using Twirla.Infrastructure.Services;

namespace Twirla.Api.Controllers;

[ApiController]
[Route("api/setup/campaign")]
public class CampaignSetupController : ControllerBase
{
    private readonly CampaignSetupTokenService _tokens;

    public CampaignSetupController(CampaignSetupTokenService tokens)
    {
        _tokens = tokens;
    }

    /// <summary>POST body: <c>{"code":"..."}</c>. Returns a bearer token for GET session / form access.</summary>
    [HttpPost("unlock")]
    public IActionResult Unlock([FromBody] UnlockRequest? body)
    {
        if (!_tokens.IsAccessCodeConfigured())
            return StatusCode(StatusCodes.Status503ServiceUnavailable,
                new { error = "Campaign setup access is not configured on the server." });

        if (!_tokens.ValidateAccessCode(body?.Code))
            return Unauthorized(new { error = "Invalid code." });

        if (!_tokens.TryCreateSessionToken(out var token, out var expiresInSeconds))
            return StatusCode(StatusCodes.Status500InternalServerError,
                new { error = "Could not create session." });

        return Ok(new { token, expiresInSeconds });
    }

    /// <summary>Validate Authorization: Bearer token from unlock.</summary>
    [HttpGet("session")]
    public IActionResult Session([FromHeader(Name = "Authorization")] string? authorization)
    {
        var token = ParseBearer(authorization);
        if (string.IsNullOrEmpty(token) || !_tokens.ValidateSessionToken(token))
            return Unauthorized();

        return Ok(new { ok = true });
    }

    private static string? ParseBearer(string? authorization)
    {
        if (string.IsNullOrWhiteSpace(authorization))
            return null;
        const string prefix = "Bearer ";
        if (!authorization.StartsWith(prefix, StringComparison.OrdinalIgnoreCase))
            return null;
        return authorization[prefix.Length..].Trim();
    }

    public class UnlockRequest
    {
        public string? Code { get; set; }
    }
}
