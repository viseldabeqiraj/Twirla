namespace Twirla.Infrastructure.Persistence.Entities;

public class ShopMemoryEntity
{
    public string ShopId { get; set; } = string.Empty;
    public int PairCount { get; set; }
    public string RevealText { get; set; } = string.Empty;
    public string? RevealSubtitle { get; set; }
    public string? PairLabelsJson { get; set; }
    public int? TimeLimitSeconds { get; set; }
    public int? MaxMistakes { get; set; }
    public string? TranslationsJson { get; set; }
    public ShopEntity Shop { get; set; } = null!;
}
