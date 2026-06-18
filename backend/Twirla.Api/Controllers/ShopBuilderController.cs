using Microsoft.AspNetCore.Mvc;
using Twirla.Domain.Entities;
using Twirla.Infrastructure.Services;

namespace Twirla.Api.Controllers;

[ApiController]
[Route("api/shop-builder")]
public class ShopBuilderController : ControllerBase
{
    private readonly ShopBuilderService _shops;
    private readonly CampaignSetupTokenService _tokens;
    private readonly R2AssetStorageService _assets;

    public ShopBuilderController(
        ShopBuilderService shops,
        CampaignSetupTokenService tokens,
        R2AssetStorageService assets)
    {
        _shops = shops;
        _tokens = tokens;
        _assets = assets;
    }

    [HttpGet("shops")]
    public async Task<IActionResult> ListShops(
        [FromHeader(Name = "Authorization")] string? authorization,
        CancellationToken cancellationToken)
    {
        if (!TryAuthorize(authorization, out var unauthorized))
            return unauthorized!;

        var items = await _shops.ListShopsAsync(cancellationToken);
        return Ok(new
        {
            shops = items.Select(s => new
            {
                s.ShopId,
                s.Slug,
                s.Name,
                s.BrandName,
                s.Enabled,
                s.ExpiresAt,
                s.PrimaryColor,
                updatedAt = s.UpdatedAt.ToString("O"),
                s.GameModes
            })
        });
    }

    [HttpGet("shops/{shopId}")]
    public async Task<IActionResult> GetShop(
        string shopId,
        [FromHeader(Name = "Authorization")] string? authorization,
        CancellationToken cancellationToken)
    {
        if (!TryAuthorize(authorization, out var unauthorized))
            return unauthorized!;

        var shop = await _shops.GetShopAsync(shopId, cancellationToken);
        if (shop == null)
            return NotFound(new { error = $"Shop \"{shopId}\" not found." });

        return Ok(new { shop });
    }

    [HttpPost("shops")]
    public async Task<IActionResult> CreateShop(
        [FromBody] ShopConfig? body,
        [FromHeader(Name = "Authorization")] string? authorization,
        CancellationToken cancellationToken)
    {
        if (!TryAuthorize(authorization, out var unauthorized))
            return unauthorized!;

        if (body == null)
            return BadRequest(new { error = "Request body is required." });

        try
        {
            var origin = Request.Headers.Origin.FirstOrDefault()
                ?? Request.Headers.Referer.FirstOrDefault()?.TrimEnd('/');
            var result = await _shops.CreateShopAsync(body, origin, cancellationToken);
            return Ok(ToResponse(result, updated: false));
        }
        catch (ShopBuilderException ex)
        {
            return Conflict(new { error = ex.Message });
        }
    }

    /// <summary>POST multipart — upload a shop image to Cloudflare R2. Returns a public HTTPS URL.</summary>
    [HttpPost("upload")]
    [RequestSizeLimit(6_000_000)]
    public async Task<IActionResult> UploadAsset(
        IFormFile? file,
        [FromForm] string? shopSlug,
        [FromForm] string? purpose,
        [FromHeader(Name = "Authorization")] string? authorization,
        CancellationToken cancellationToken)
    {
        if (!TryAuthorize(authorization, out var unauthorized))
            return unauthorized!;

        if (!_assets.IsConfigured)
        {
            return StatusCode(StatusCodes.Status503ServiceUnavailable,
                new { error = "Image upload is not configured (set TWIRLA_R2_* on the API)." });
        }

        if (file == null || file.Length == 0)
            return BadRequest(new { error = "Choose an image file to upload." });

        if (file.Length > 5 * 1024 * 1024)
            return BadRequest(new { error = "Image must be 5 MB or smaller." });

        var contentType = file.ContentType?.Trim().ToLowerInvariant() ?? "";
        if (!IsAllowedImageContentType(contentType))
            return BadRequest(new { error = "Only JPEG, PNG, WebP, GIF, and SVG images are allowed." });

        var slug = SanitizeSlug(shopSlug) ?? "shop";
        var slot = SanitizePurpose(purpose);
        var ext = ExtensionForContentType(contentType, file.FileName);
        var key = $"shops/{slug}/{slot}-{Guid.NewGuid():N}{ext}";

        await using var stream = file.OpenReadStream();
        var result = await _assets.UploadAsync(stream, contentType, key, cancellationToken);
        return Ok(new { url = result.PublicUrl, key = result.Key });
    }

    [HttpPut("shops/{shopId}")]
    public async Task<IActionResult> UpdateShop(
        string shopId,
        [FromBody] ShopConfig? body,
        [FromHeader(Name = "Authorization")] string? authorization,
        CancellationToken cancellationToken)
    {
        if (!TryAuthorize(authorization, out var unauthorized))
            return unauthorized!;

        if (body == null)
            return BadRequest(new { error = "Request body is required." });

        body.ShopId = shopId;

        try
        {
            var origin = Request.Headers.Origin.FirstOrDefault()
                ?? Request.Headers.Referer.FirstOrDefault()?.TrimEnd('/');
            var result = await _shops.UpdateShopAsync(body, origin, cancellationToken);
            return Ok(ToResponse(result, updated: true));
        }
        catch (ShopBuilderException ex)
        {
            return Conflict(new { error = ex.Message });
        }
    }

    private bool TryAuthorize(string? authorization, out IActionResult? failure)
    {
        failure = null;
        if (!_tokens.IsAccessCodeConfigured())
        {
            failure = StatusCode(StatusCodes.Status503ServiceUnavailable,
                new { error = "Shop builder is not configured (set CampaignSetup:AccessCode)." });
            return false;
        }

        var bearer = ParseBearer(authorization);
        if (string.IsNullOrEmpty(bearer) || !_tokens.ValidateSessionToken(bearer))
        {
            failure = Unauthorized(new { error = "Invalid or expired session. Unlock at /setup/shop-builder." });
            return false;
        }

        return true;
    }

    private static object ToResponse(CreateShopResult result, bool updated) => new
    {
        shop = result.Shop,
        adminToken = result.AdminToken,
        landingUrl = result.LandingUrl,
        adminUrl = result.AdminUrl,
        experiencePathShopId = result.ExperiencePathShopId,
        gameUrls = result.GameUrls.Select(g => new { mode = g.Mode, url = g.Url }),
        updated
    };

    private static string? ParseBearer(string? authorization)
    {
        if (string.IsNullOrWhiteSpace(authorization))
            return null;
        const string prefix = "Bearer ";
        return authorization.StartsWith(prefix, StringComparison.OrdinalIgnoreCase)
            ? authorization[prefix.Length..].Trim()
            : null;
    }

    private static bool IsAllowedImageContentType(string contentType) =>
        contentType is "image/jpeg" or "image/png" or "image/webp" or "image/gif" or "image/svg+xml";

    private static string? SanitizeSlug(string? raw)
    {
        if (string.IsNullOrWhiteSpace(raw))
            return null;
        var chars = raw.Trim().ToLowerInvariant()
            .Where(c => char.IsAsciiLetterOrDigit(c) || c == '-')
            .ToArray();
        var s = new string(chars).Trim('-');
        return string.IsNullOrEmpty(s) ? null : s[..Math.Min(s.Length, 48)];
    }

    private static string SanitizePurpose(string? raw)
    {
        if (string.IsNullOrWhiteSpace(raw))
            return "asset";
        var chars = raw.Trim().ToLowerInvariant()
            .Where(c => char.IsAsciiLetterOrDigit(c) || c == '-')
            .ToArray();
        var s = new string(chars).Trim('-');
        return string.IsNullOrEmpty(s) ? "asset" : s[..Math.Min(s.Length, 32)];
    }

    private static string ExtensionForContentType(string contentType, string fileName)
    {
        return contentType switch
        {
            "image/jpeg" => ".jpg",
            "image/png" => ".png",
            "image/webp" => ".webp",
            "image/gif" => ".gif",
            "image/svg+xml" => ".svg",
            _ => Path.GetExtension(fileName).ToLowerInvariant() is { Length: > 0 and <= 5 } ext
                ? ext
                : ".jpg"
        };
    }
}
