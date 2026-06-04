namespace Twirla.Infrastructure.Persistence.Entities;

/// <summary>1:1 branding row per shop (colors, logo, theme).</summary>
public class ShopBrandingEntity
{
    public string ShopId { get; set; } = string.Empty;
    public string PrimaryColor { get; set; } = "#000000";
    public string SecondaryColor { get; set; } = "#FFFFFF";
    public string? LogoUrl { get; set; }
    public string? BrandName { get; set; }
    public string? AccentColor { get; set; }
    public string? BackgroundMode { get; set; }
    public string? LogoBackgroundColor { get; set; }
    public string? SpotDeep { get; set; }
    public string? SpotMuted { get; set; }
    public string? SpotWash { get; set; }
    public string? SpotAccent { get; set; }
    public string? ThemeBackgroundPattern { get; set; }
    public string? ThemeSurfaceStyle { get; set; }
    public string? ThemeAmbientMotion { get; set; }
    public string? ThemeFontFamily { get; set; }
    public int? ThemeBorderRadius { get; set; }
    public int? ThemeButtonRadius { get; set; }
    public bool? ThemeParticlesEnabled { get; set; }
    public string? ThemeParticlesShape { get; set; }
    public string? ThemeParticlesDensity { get; set; }
    public string? ThemeParticlesColor { get; set; }
    public string? ThemeParticlesAccentColor { get; set; }
    public ShopEntity Shop { get; set; } = null!;
}
