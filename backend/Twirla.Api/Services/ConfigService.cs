using System.Text.Json;
using Twirla.Api.Models;
using Twirla.Api.Utils;

namespace Twirla.Api.Services;

public class ConfigService
{
    private readonly Dictionary<string, ShopConfig> _configs = new();
    private readonly string _configFilePath;

    public ConfigService(IWebHostEnvironment env)
    {
        _configFilePath = Path.Combine(env.ContentRootPath, "Data", "shops.json");
        LoadConfigsFromFile();
        InitializeDemoConfigs(); // Keep demo configs for backward compatibility
    }

    public ShopConfig? GetConfig(string shopId)
    {
        Console.WriteLine($"Looking up shop config for: {shopId}");
        Console.WriteLine($"Available shop IDs: {string.Join(", ", _configs.Keys)}");
        return _configs.TryGetValue(shopId, out var config) ? config : null;
    }

    private void LoadConfigsFromFile()
    {
        try
        {
            Console.WriteLine($"Loading shop configs from: {_configFilePath}");
            if (File.Exists(_configFilePath))
            {
                var json = File.ReadAllText(_configFilePath);
                var options = new JsonSerializerOptions
                {
                    PropertyNameCaseInsensitive = true
                };
                options.Converters.Add(new System.Text.Json.Serialization.JsonStringEnumConverter());
                var data = JsonSerializer.Deserialize<ShopsData>(json, options);
                
                if (data?.Shops != null)
                {
                    Console.WriteLine($"Loaded {data.Shops.Count} shops from JSON file");
                    foreach (var shop in data.Shops)
                    {
                        _configs[shop.ShopId] = shop;
                        var defaultMode = shop.GetDefaultMode();
                        Console.WriteLine($"  - Loaded shop: {shop.ShopId} (Default Mode: {defaultMode?.ToString() ?? "None"})");
                    }
                }
                else
                {
                    Console.WriteLine("Warning: No shops found in JSON file");
                }
            }
            else
            {
                Console.WriteLine($"Warning: Config file not found at: {_configFilePath}");
            }
        }
        catch (Exception ex)
        {
            // Log error but don't crash - fall back to demo configs
            Console.WriteLine($"Error loading shop configs from file: {ex.Message}");
            Console.WriteLine($"Stack trace: {ex.StackTrace}");
        }
    }

    private void InitializeDemoConfigs()
    {
        // Demo Wheel config
        _configs["demo-wheel"] = new ShopConfig
        {
            ShopId = "demo-wheel",
            Branding = new BrandingConfig
            {
                PrimaryColor = "#FF6B6B",
                SecondaryColor = "#4ECDC4",
                BrandName = "Demo Shop"
            },
            Text = new TextConfig
            {
                Title = "Spin to Win!",
                Subtitle = "Try your luck and win amazing prizes",
                CtaText = "DM us to claim your prize",
                ResultTitle = "Congratulations!",
                ResultSubtitle = "You've won a prize!"
            },
            Cta = new CtaConfig
            {
                Url = "https://instagram.com/demoshop"
            },
            Wheel = new WheelConfig
            {
                AllowRepeatSpins = false,
                Prizes = new List<PrizeConfig>
                {
                    new() { Label = "10% Off", Weight = 30, Description = "Get 10% off your next purchase" },
                    new() { Label = "20% Off", Weight = 20, Description = "Get 20% off your next purchase" },
                    new() { Label = "Free Shipping", Weight = 25, Description = "Free shipping on your order" },
                    new() { Label = "50% Off", Weight = 10, Description = "Get 50% off your next purchase" },
                    new() { Label = "Try Again", Weight = 15, Description = "Better luck next time!" }
                }
            }
        };

        // Demo TapHearts config
        _configs["demo-hearts"] = new ShopConfig
        {
            ShopId = "demo-hearts",
            Branding = new BrandingConfig
            {
                PrimaryColor = "#FF69B4",
                SecondaryColor = "#FFB6C1",
                BrandName = "Love Shop"
            },
            Text = new TextConfig
            {
                Title = "Tap the Hearts!",
                Subtitle = "Tap 10 hearts to reveal your surprise",
                CtaText = "Claim your reward",
                ResultTitle = "You did it!",
                ResultSubtitle = "Thanks for all the love!"
            },
            Cta = new CtaConfig
            {
                Url = "https://instagram.com/loveshop"
            },
            TapHearts = new TapHeartsConfig
            {
                HeartsToTap = 10,
                HeartColor = "#FF69B4",
                RevealText = "You've unlocked a special discount!",
                RevealSubtitle = "Use code LOVE20 for 20% off"
            }
        };

        // Demo Scratch config
        _configs["demo-scratch"] = new ShopConfig
        {
            ShopId = "demo-scratch",
            Branding = new BrandingConfig
            {
                PrimaryColor = "#FFD700",
                SecondaryColor = "#FFA500",
                BrandName = "Golden Shop"
            },
            Text = new TextConfig
            {
                Title = "Scratch to Reveal!",
                Subtitle = "See what's underneath",
                CtaText = "Get your prize",
                ResultTitle = "Amazing!",
                ResultSubtitle = "You've revealed your prize!"
            },
            Cta = new CtaConfig
            {
                Url = "https://instagram.com/goldenshop"
            },
            Scratch = new ScratchConfig
            {
                OverlayColor = "#CCCCCC",
                OverlayText = "Scratch here!",
                RevealText = "You won 25% off!",
                RevealSubtitle = "Use code SCRATCH25 at checkout"
            }
        };

        // Demo Countdown config
        _configs["demo-countdown"] = new ShopConfig
        {
            ShopId = "demo-countdown",
            Branding = new BrandingConfig
            {
                PrimaryColor = "#9B59B6",
                SecondaryColor = "#E74C3C",
                BrandName = "Flash Sale"
            },
            Text = new TextConfig
            {
                Title = "Flash Sale Starting Soon!",
                Subtitle = "Don't miss out on amazing deals",
                CtaText = "Shop Now",
                ResultTitle = "Sale is Live!",
                ResultSubtitle = "Hurry, limited time only!"
            },
            Cta = new CtaConfig
            {
                Url = "https://instagram.com/flashsale"
            },
            Countdown = new CountdownConfig
            {
                EndAt = DateTime.UtcNow.AddDays(2).AddHours(5).ToString("O"),
                EndMessage = "The sale is now live! Shop now before it ends!",
                ShowCtaBeforeEnd = true
            }
        };
    }

    private class ShopsData
    {
        public List<ShopConfig>? Shops { get; set; }
    }
}

