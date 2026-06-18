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

    public ShopBuilderController(ShopBuilderService shops, CampaignSetupTokenService tokens)
    {
        _shops = shops;
        _tokens = tokens;
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
}
