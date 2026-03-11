using Microsoft.AspNetCore.Mvc;
using Twirla.Application.Interfaces;
using Twirla.Domain.Entities;

namespace Twirla.Api.Controllers;

[ApiController]
[Route("api/config")]
public class ConfigController : ControllerBase
{
    private readonly IShopConfigService _configService;

    public ConfigController(IShopConfigService configService)
    {
        _configService = configService;
    }

    /// <summary>GET /api/config/{shopId}?lang=</summary>
    [HttpGet("{shopId}")]
    public IActionResult GetConfig(string shopId, [FromQuery] string? lang)
    {
        var config = _configService.GetByShopId(shopId);
        if (config == null)
            return NotFound(new { error = "Shop configuration not found" });

        return Ok(config.GetForLanguage(lang));
    }

    /// <summary>GET /api/config/{shopId}/{mode}?lang=</summary>
    [HttpGet("{shopId}/{mode}")]
    public IActionResult GetConfigByMode(string shopId, string mode, [FromQuery] string? lang)
    {
        var config = _configService.GetByShopId(shopId);
        if (config == null)
            return NotFound(new { error = "Shop configuration not found" });

        if (!Enum.TryParse<ExperienceMode>(mode, true, out var experienceMode))
            return BadRequest(new { error = $"Invalid mode: {mode}" });

        var hasMode = experienceMode switch
        {
            ExperienceMode.Wheel => config.Wheel != null,
            ExperienceMode.TapHearts => config.TapHearts != null,
            ExperienceMode.Scratch => config.Scratch != null,
            ExperienceMode.Countdown => config.Countdown != null,
            _ => false
        };

        if (!hasMode)
            return NotFound(new { error = $"Mode '{mode}' not configured for this shop" });

        return Ok(config.GetForLanguage(lang));
    }

    /// <summary>GET /api/config/by-slug/{slug}?lang= — Resolve shop by slug (e.g. pinkster, demo).</summary>
    [HttpGet("by-slug/{slug}")]
    public IActionResult GetConfigBySlug(string slug, [FromQuery] string? lang)
    {
        var config = _configService.GetBySlug(slug);
        if (config == null)
            return NotFound(new { error = "Shop not found" });

        return Ok(config.GetForLanguage(lang));
    }

    /// <summary>GET /api/config/by-slug/{slug}/{mode}?lang=</summary>
    [HttpGet("by-slug/{slug}/{mode}")]
    public IActionResult GetConfigBySlugAndMode(string slug, string mode, [FromQuery] string? lang)
    {
        var config = _configService.GetBySlug(slug);
        if (config == null)
            return NotFound(new { error = "Shop not found" });

        if (!Enum.TryParse<ExperienceMode>(mode, true, out var experienceMode))
            return BadRequest(new { error = $"Invalid mode: {mode}" });

        var hasMode = experienceMode switch
        {
            ExperienceMode.Wheel => config.Wheel != null,
            ExperienceMode.TapHearts => config.TapHearts != null,
            ExperienceMode.Scratch => config.Scratch != null,
            ExperienceMode.Countdown => config.Countdown != null,
            _ => false
        };

        if (!hasMode)
            return NotFound(new { error = $"Mode '{mode}' not configured for this shop" });

        return Ok(config.GetForLanguage(lang));
    }
}
