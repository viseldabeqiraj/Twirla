using System.Text.Json;
using Microsoft.AspNetCore.Hosting;
using Twirla.Application.Interfaces;
using Twirla.Domain.Entities;

namespace Twirla.Infrastructure.Services;

public class ShopConfigService : IShopConfigService
{
    private readonly Dictionary<string, ShopConfig> _configsByShopId = new();
    private readonly Dictionary<string, ShopConfig> _configsBySlug = new(StringComparer.OrdinalIgnoreCase);
    private readonly string _configFilePath;

    public ShopConfigService(IWebHostEnvironment env)
    {
        _configFilePath = Path.Combine(env.ContentRootPath, "Data", "shops.json");
        LoadConfigsFromFile();
        InitializeDemoConfigs();
    }

    public ShopConfig? GetByShopId(string shopId) =>
        _configsByShopId.TryGetValue(shopId, out var config) ? config : null;

    public ShopConfig? GetBySlug(string slug) =>
        _configsBySlug.TryGetValue(slug ?? "", out var config) ? config : null;

    public ShopConfig? ValidateAdminToken(string? slug, string? token)
    {
        if (string.IsNullOrWhiteSpace(slug) || string.IsNullOrWhiteSpace(token))
            return null;
        var shop = GetBySlug(slug);
        if (shop == null || string.IsNullOrWhiteSpace(shop.AdminToken))
            return null;
        return shop.AdminToken == token ? shop : null;
    }

    private void LoadConfigsFromFile()
    {
        try
        {
            if (!File.Exists(_configFilePath))
                return;

            var json = File.ReadAllText(_configFilePath);
            var options = new JsonSerializerOptions { PropertyNameCaseInsensitive = true };
            options.Converters.Add(new System.Text.Json.Serialization.JsonStringEnumConverter());
            var data = JsonSerializer.Deserialize<ShopsData>(json, options);

            if (data?.Shops == null)
                return;

            foreach (var shop in data.Shops)
            {
                _configsByShopId[shop.ShopId] = shop;
                if (!string.IsNullOrWhiteSpace(shop.Slug))
                    _configsBySlug[shop.Slug] = shop;
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error loading shop configs: {ex.Message}");
        }
    }

    private void InitializeDemoConfigs()
    {
        var demos = new[]
        {
            CreateDemoWheel(),
            CreateDemoHearts(),
            CreateDemoScratch(),
            CreateDemoCountdown()
        };

        foreach (var shop in demos)
        {
            _configsByShopId[shop.ShopId] = shop;
            _configsBySlug[shop.Slug ?? shop.ShopId] = shop;
        }
    }

    private static ShopConfig CreateDemoWheel() => new()
    {
        ShopId = "demo-wheel",
        Slug = "demo-wheel",
        Name = "Demo Wheel",
        AdminToken = "demo-admin-token",
        Branding = new BrandingConfig { PrimaryColor = "#FF6B6B", SecondaryColor = "#4ECDC4", BrandName = "Demo Shop" },
        Text = new TextConfig { Title = "Spin to Win!", Subtitle = "Try your luck", CtaText = "DM us", ResultTitle = "Congratulations!", ResultSubtitle = "You've won!" },
        Cta = new CtaConfig { Url = "https://instagram.com/demoshop" },
        Wheel = new WheelConfig
        {
            AllowRepeatSpins = false,
            Prizes = new List<PrizeConfig>
            {
                new() { Label = "10% Off", Weight = 30, Description = "Get 10% off" },
                new() { Label = "20% Off", Weight = 20, Description = "Get 20% off" },
                new() { Label = "Free Shipping", Weight = 25, Description = "Free shipping" },
                new() { Label = "50% Off", Weight = 10, Description = "Get 50% off" },
                new() { Label = "Try Again", Weight = 15, Description = "Better luck next time!" }
            }
        }
    };

    private static ShopConfig CreateDemoHearts() => new()
    {
        ShopId = "demo-hearts",
        Slug = "demo-hearts",
        Name = "Demo Hearts",
        AdminToken = "demo-admin-token",
        Branding = new BrandingConfig { PrimaryColor = "#FF69B4", SecondaryColor = "#FFB6C1", BrandName = "Love Shop" },
        Text = new TextConfig { Title = "Tap the Hearts!", Subtitle = "Tap 10 hearts", CtaText = "Claim", ResultTitle = "You did it!", ResultSubtitle = "Thanks!" },
        Cta = new CtaConfig { Url = "https://instagram.com/loveshop" },
        TapHearts = new TapHeartsConfig { HeartsToTap = 10, HeartColor = "#FF69B4", RevealText = "Special discount!", RevealSubtitle = "Use LOVE20" }
    };

    private static ShopConfig CreateDemoScratch() => new()
    {
        ShopId = "demo-scratch",
        Slug = "demo-scratch",
        Name = "Demo Scratch",
        AdminToken = "demo-admin-token",
        Branding = new BrandingConfig { PrimaryColor = "#FFD700", SecondaryColor = "#FFA500", BrandName = "Golden Shop" },
        Text = new TextConfig { Title = "Scratch to Reveal!", Subtitle = "See what's underneath", CtaText = "Get prize", ResultTitle = "Amazing!", ResultSubtitle = "Revealed!" },
        Cta = new CtaConfig { Url = "https://instagram.com/goldenshop" },
        Scratch = new ScratchConfig { OverlayColor = "#CCCCCC", OverlayText = "Scratch here!", RevealText = "25% off!", RevealSubtitle = "Use SCRATCH25" }
    };

    private static ShopConfig CreateDemoCountdown() => new()
    {
        ShopId = "demo-countdown",
        Slug = "demo-countdown",
        Name = "Demo Countdown",
        AdminToken = "demo-admin-token",
        Branding = new BrandingConfig { PrimaryColor = "#9B59B6", SecondaryColor = "#E74C3C", BrandName = "Flash Sale" },
        Text = new TextConfig { Title = "Flash Sale Soon!", Subtitle = "Don't miss out", CtaText = "Shop Now", ResultTitle = "Sale is Live!", ResultSubtitle = "Hurry!" },
        Cta = new CtaConfig { Url = "https://instagram.com/flashsale" },
        Countdown = new CountdownConfig { EndAt = DateTime.UtcNow.AddDays(2).ToString("O"), EndMessage = "Sale is live!", ShowCtaBeforeEnd = true }
    };

    private class ShopsData
    {
        public List<ShopConfig>? Shops { get; set; }
    }
}
