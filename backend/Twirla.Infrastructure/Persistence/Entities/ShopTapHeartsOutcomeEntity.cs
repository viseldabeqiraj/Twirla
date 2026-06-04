namespace Twirla.Infrastructure.Persistence.Entities;

public class ShopTapHeartsOutcomeEntity
{
    public int Id { get; set; }
    public string ShopId { get; set; } = string.Empty;
    public int SortOrder { get; set; }
    public string Headline { get; set; } = string.Empty;
    public string? Description { get; set; }
    public int Weight { get; set; }
    public bool? IsNoWin { get; set; }
    public ShopTapHeartsEntity TapHearts { get; set; } = null!;
}
