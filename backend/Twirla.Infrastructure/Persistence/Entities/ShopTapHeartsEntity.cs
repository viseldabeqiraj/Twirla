namespace Twirla.Infrastructure.Persistence.Entities;

public class ShopTapHeartsEntity
{
    public string ShopId { get; set; } = string.Empty;
    public int HeartsToTap { get; set; }
    public string HeartColor { get; set; } = "#FF0000";
    public string RevealText { get; set; } = string.Empty;
    public string? RevealSubtitle { get; set; }
    public string? TranslationsJson { get; set; }
    public ICollection<ShopTapHeartsOutcomeEntity> Outcomes { get; set; } = new List<ShopTapHeartsOutcomeEntity>();
    public ShopEntity Shop { get; set; } = null!;
}
