using Microsoft.AspNetCore.Mvc;
using Twirla.Application.Dto;
using Twirla.Application.Interfaces;

namespace Twirla.Api.Controllers;

[ApiController]
[Route("api/admin/shops")]
public class AdminController : ControllerBase
{
    private readonly IShopConfigService _configService;
    private readonly IAnalyticsService _analyticsService;
    private readonly ICouponService _couponService;
    private readonly ILogger<AdminController> _logger;

    public AdminController(
        IShopConfigService configService,
        IAnalyticsService analyticsService,
        ICouponService couponService,
        ILogger<AdminController> logger)
    {
        _configService = configService;
        _analyticsService = analyticsService;
        _couponService = couponService;
        _logger = logger;
    }

    /// <summary>GET /api/admin/shops/{slug}/summary?token=</summary>
    [HttpGet("{slug}/summary")]
    public IActionResult GetSummary(string slug, [FromQuery] string? token)
    {
        try
        {
            var shop = _configService.ValidateAdminToken(slug, token);
            if (shop == null)
                return StatusCode(403, new { error = "Invalid or missing token." });

            var summary = _analyticsService.GetSummary(shop.ShopId);
            return Ok(summary);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Admin summary failed for slug {Slug}", slug);
            return StatusCode(500, new { error = "Server error.", detail = ex.Message });
        }
    }

    /// <summary>GET /api/admin/shops/{slug}/analytics/daily-revenue?token=</summary>
    [HttpGet("{slug}/analytics/daily-revenue")]
    public IActionResult GetDailyRevenue(string slug, [FromQuery] string? token)
    {
        var shop = _configService.ValidateAdminToken(slug, token);
        if (shop == null)
            return StatusCode(403, new { error = "Invalid or missing token." });

        var data = _analyticsService.GetDailyAttributedRevenue(shop.ShopId);
        return Ok(data);
    }

    /// <summary>POST /api/admin/shops/{slug}/redeem-coupon?token=</summary>
    [HttpPost("{slug}/redeem-coupon")]
    public async Task<IActionResult> RedeemCoupon(string slug, [FromQuery] string? token, CancellationToken cancellationToken)
    {
        var shop = _configService.ValidateAdminToken(slug, token);
        if (shop == null)
            return StatusCode(403, new { error = "Invalid or missing token." });

        RedeemCouponRequest? body;
        try
        {
            body = await Request.ReadFromJsonAsync<RedeemCouponRequest>(cancellationToken);
        }
        catch
        {
            return BadRequest(new { error = "Invalid request body." });
        }

        if (body == null || string.IsNullOrWhiteSpace(body.CouponCode))
            return BadRequest(new { error = "Coupon code is required." });

        var orderValue = body.OrderValue ?? 0;
        var (success, error) = _couponService.RedeemCoupon(shop.ShopId, body.CouponCode, orderValue);

        if (success)
            return Ok(new { message = "Coupon redeemed successfully." });

        return BadRequest(new { error = error ?? "Redemption failed." });
    }
}
