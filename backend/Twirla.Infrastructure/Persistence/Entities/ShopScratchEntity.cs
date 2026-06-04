namespace Twirla.Infrastructure.Persistence.Entities;

public class ShopScratchEntity
{
    public string ShopId { get; set; } = string.Empty;
    public string OverlayColor { get; set; } = "#CCCCCC";
    public string OverlayText { get; set; } = string.Empty;
    public string RevealText { get; set; } = string.Empty;
    public string? RevealSubtitle { get; set; }
    public string? TranslationsJson { get; set; }
    public ShopEntity Shop { get; set; } = null!;
}
