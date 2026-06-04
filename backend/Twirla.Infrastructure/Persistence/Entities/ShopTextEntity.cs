namespace Twirla.Infrastructure.Persistence.Entities;

public class ShopTextEntity
{
    public string ShopId { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string? Subtitle { get; set; }
    public string CtaText { get; set; } = string.Empty;
    public string ResultTitle { get; set; } = string.Empty;
    public string? ResultSubtitle { get; set; }
    public int? MaxDiscountPercent { get; set; }
    public string? TranslationsJson { get; set; }
    public ShopEntity Shop { get; set; } = null!;
}
