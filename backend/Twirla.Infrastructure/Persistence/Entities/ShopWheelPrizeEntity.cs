namespace Twirla.Infrastructure.Persistence.Entities;

public class ShopWheelPrizeEntity
{
    public int Id { get; set; }
    public string ShopId { get; set; } = string.Empty;
    public int SortOrder { get; set; }
    public string Label { get; set; } = string.Empty;
    public int Weight { get; set; }
    public string? IconUrl { get; set; }
    public string? Description { get; set; }
    public bool? IsWinning { get; set; }
    public string? TranslationsJson { get; set; }
    public ShopWheelEntity Wheel { get; set; } = null!;
}
