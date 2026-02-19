using System.Linq;

namespace Twirla.Api.Models;

public class ShopConfig
{
    public string ShopId { get; set; } = string.Empty;
    public int? PlayCooldownHours { get; set; } = 24; // Default 24 hours between plays
    public BrandingConfig Branding { get; set; } = new();
    public TextConfig Text { get; set; } = new();
    public CtaConfig Cta { get; set; } = new();
    public WheelConfig? Wheel { get; set; }
    public TapHeartsConfig? TapHearts { get; set; }
    public ScratchConfig? Scratch { get; set; }
    public CountdownConfig? Countdown { get; set; }
    
    // Helper method to get the mode based on which configs are available
    // For backward compatibility
    public ExperienceMode? GetDefaultMode()
    {
        if (Wheel != null) return ExperienceMode.Wheel;
        if (TapHearts != null) return ExperienceMode.TapHearts;
        if (Scratch != null) return ExperienceMode.Scratch;
        if (Countdown != null) return ExperienceMode.Countdown;
        return null;
    }
    
    // Get translated version of the config
    public ShopConfig GetForLanguage(string? language)
    {
        if (string.IsNullOrEmpty(language))
        {
            return this;
        }
        
        return new ShopConfig
        {
            ShopId = ShopId,
            PlayCooldownHours = PlayCooldownHours,
            Branding = Branding, // Branding doesn't need translation
            Text = Text.GetForLanguage(language),
            Cta = Cta, // CTA URL doesn't need translation
            Wheel = Wheel != null ? new WheelConfig
            {
                AllowRepeatSpins = Wheel.AllowRepeatSpins,
                Prizes = Wheel.Prizes.Select(p => p.GetForLanguage(language)).ToList()
            } : null,
            TapHearts = TapHearts?.GetForLanguage(language),
            Scratch = Scratch?.GetForLanguage(language),
            Countdown = Countdown?.GetForLanguage(language)
        };
    }
}

public enum ExperienceMode
{
    Wheel,
    TapHearts,
    Scratch,
    Countdown
}

public class BrandingConfig
{
    public string PrimaryColor { get; set; } = "#000000";
    public string SecondaryColor { get; set; } = "#FFFFFF";
    public string? LogoUrl { get; set; }
    public string? BrandName { get; set; }
    public string? AccentColor { get; set; }
    public ThemeConfig? Theme { get; set; }
}

public class ThemeConfig
{
    public string? BackgroundPattern { get; set; }
    public string? SurfaceStyle { get; set; }
    public string? FontFamily { get; set; }
    public int? BorderRadius { get; set; }
    public int? ButtonRadius { get; set; }
}

public class TextConfig
{
    public string Title { get; set; } = string.Empty;
    public string? Subtitle { get; set; }
    public string CtaText { get; set; } = string.Empty;
    public string ResultTitle { get; set; } = string.Empty;
    public string? ResultSubtitle { get; set; }
    
    // Translations - if provided, these override the default text based on language
    public Dictionary<string, TextConfig>? Translations { get; set; }
    
    // Helper method to get text for a specific language
    public TextConfig GetForLanguage(string? language)
    {
        if (string.IsNullOrEmpty(language) || Translations == null || !Translations.ContainsKey(language))
        {
            return this;
        }
        
        var translated = Translations[language];
        // Merge with base config (translated values override, but fallback to base if missing)
        return new TextConfig
        {
            Title = !string.IsNullOrEmpty(translated.Title) ? translated.Title : Title,
            Subtitle = !string.IsNullOrEmpty(translated.Subtitle) ? translated.Subtitle : Subtitle,
            CtaText = !string.IsNullOrEmpty(translated.CtaText) ? translated.CtaText : CtaText,
            ResultTitle = !string.IsNullOrEmpty(translated.ResultTitle) ? translated.ResultTitle : ResultTitle,
            ResultSubtitle = !string.IsNullOrEmpty(translated.ResultSubtitle) ? translated.ResultSubtitle : ResultSubtitle
        };
    }
}

public class CtaConfig
{
    public string Url { get; set; } = string.Empty;
}

public class WheelConfig
{
    public bool AllowRepeatSpins { get; set; }
    public List<PrizeConfig> Prizes { get; set; } = new();
}

public class PrizeConfig
{
    public string Label { get; set; } = string.Empty;
    public int Weight { get; set; }
    public string? IconUrl { get; set; }
    public string? Description { get; set; }
    public bool? IsWinning { get; set; } // null = auto-detect, true = winning, false = losing
    
    // Translations
    public Dictionary<string, PrizeConfig>? Translations { get; set; }
    
    public PrizeConfig GetForLanguage(string? language)
    {
        if (string.IsNullOrEmpty(language) || Translations == null || !Translations.ContainsKey(language))
        {
            return this;
        }
        
        var translated = Translations[language];
        return new PrizeConfig
        {
            Label = !string.IsNullOrEmpty(translated.Label) ? translated.Label : Label,
            Weight = Weight, // Weight doesn't change
            IconUrl = IconUrl, // Icon doesn't change
            Description = !string.IsNullOrEmpty(translated.Description) ? translated.Description : Description,
            IsWinning = IsWinning // Winning status doesn't change with translation
        };
    }
    
    // Helper to determine if prize is winning (auto-detect if not explicitly set)
    public bool GetIsWinning()
    {
        // If explicitly set, use that value
        if (IsWinning.HasValue)
        {
            return IsWinning.Value;
        }
        
        // Auto-detect: only mark as losing if label EXACTLY matches losing patterns
        // This prevents false positives (e.g., "20% Off" should never match "off" in "no prize")
        var losingPatterns = new[] { 
            "try again", 
            "better luck", 
            "no prize", 
            "nothing", 
            "unlucky",
            "sorry",
            "no win",
            "not this time"
        };
        var labelLower = Label.ToLowerInvariant().Trim();
        
        // Only match if label is exactly a losing pattern (case-insensitive)
        // This is very strict to avoid false positives
        var isLosing = losingPatterns.Contains(labelLower);
        
        // Default to winning (most prizes like discounts, free shipping, etc. are winning)
        return !isLosing;
    }
}

public class TapHeartsConfig
{
    public int HeartsToTap { get; set; }
    public string HeartColor { get; set; } = "#FF0000";
    public string RevealText { get; set; } = string.Empty;
    public string? RevealSubtitle { get; set; }
    
    // Translations
    public Dictionary<string, TapHeartsConfig>? Translations { get; set; }
    
    public TapHeartsConfig GetForLanguage(string? language)
    {
        if (string.IsNullOrEmpty(language) || Translations == null || !Translations.ContainsKey(language))
        {
            return this;
        }
        
        var translated = Translations[language];
        return new TapHeartsConfig
        {
            HeartsToTap = HeartsToTap,
            HeartColor = HeartColor,
            RevealText = !string.IsNullOrEmpty(translated.RevealText) ? translated.RevealText : RevealText,
            RevealSubtitle = !string.IsNullOrEmpty(translated.RevealSubtitle) ? translated.RevealSubtitle : RevealSubtitle
        };
    }
}

public class ScratchConfig
{
    public string OverlayColor { get; set; } = "#CCCCCC";
    public string OverlayText { get; set; } = string.Empty;
    public string RevealText { get; set; } = string.Empty;
    public string? RevealSubtitle { get; set; }
    
    // Translations
    public Dictionary<string, ScratchConfig>? Translations { get; set; }
    
    public ScratchConfig GetForLanguage(string? language)
    {
        if (string.IsNullOrEmpty(language) || Translations == null || !Translations.ContainsKey(language))
        {
            return this;
        }
        
        var translated = Translations[language];
        return new ScratchConfig
        {
            OverlayColor = OverlayColor,
            OverlayText = !string.IsNullOrEmpty(translated.OverlayText) ? translated.OverlayText : OverlayText,
            RevealText = !string.IsNullOrEmpty(translated.RevealText) ? translated.RevealText : RevealText,
            RevealSubtitle = !string.IsNullOrEmpty(translated.RevealSubtitle) ? translated.RevealSubtitle : RevealSubtitle
        };
    }
}

public class CountdownConfig
{
    public string EndAt { get; set; } = string.Empty; // ISO 8601 string
    public string EndMessage { get; set; } = string.Empty;
    public bool ShowCtaBeforeEnd { get; set; } = true;
    
    // Translations
    public Dictionary<string, CountdownConfig>? Translations { get; set; }
    
    public CountdownConfig GetForLanguage(string? language)
    {
        if (string.IsNullOrEmpty(language) || Translations == null || !Translations.ContainsKey(language))
        {
            return this;
        }
        
        var translated = Translations[language];
        return new CountdownConfig
        {
            EndAt = EndAt,
            EndMessage = !string.IsNullOrEmpty(translated.EndMessage) ? translated.EndMessage : EndMessage,
            ShowCtaBeforeEnd = ShowCtaBeforeEnd
        };
    }
}

