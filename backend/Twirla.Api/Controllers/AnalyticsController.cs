using Microsoft.AspNetCore.Mvc;
using Twirla.Application.Dto;
using Twirla.Application.Interfaces;
using Twirla.Domain.Entities;

namespace Twirla.Api.Controllers;

[ApiController]
[Route("api/shops")]
public class AnalyticsController : ControllerBase
{
    private readonly IShopConfigService _configService;
    private readonly IAnalyticsService _analyticsService;

    public AnalyticsController(IShopConfigService configService, IAnalyticsService analyticsService)
    {
        _configService = configService;
        _analyticsService = analyticsService;
    }

    /// <summary>POST /api/shops/{shopId}/analytics/event - Public tracking (no auth).</summary>
    [HttpPost("{shopId}/analytics/event")]
    public IActionResult TrackEvent(string shopId, [FromBody] AnalyticsEventRequest? body)
    {
        if (string.IsNullOrWhiteSpace(shopId))
            return BadRequest(new { error = "Shop ID is required." });

        var config = _configService.GetByShopId(shopId);
        if (config == null)
            return NotFound(new { error = "Shop not found." });

        if (body == null || string.IsNullOrWhiteSpace(body.Event))
            return BadRequest(new { error = "Event type is required." });

        var record = new AnalyticsEventRecord
        {
            Event = body.Event.Trim(),
            VisitorId = body.VisitorId?.Trim(),
            SessionId = body.SessionId?.Trim(),
            Value = body.Value,
            Mode = body.Mode?.Trim(),
            CouponCode = body.CouponCode?.Trim(),
        };

        _analyticsService.AppendEvent(shopId, record);
        return Ok(new { ok = true });
    }
}
