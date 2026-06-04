namespace Twirla.Infrastructure.Persistence.Entities;

public class ShopCountdownEntity
{
    public string ShopId { get; set; } = string.Empty;
    public string EndAt { get; set; } = string.Empty;
    public string EndMessage { get; set; } = string.Empty;
    public bool ShowCtaBeforeEnd { get; set; } = true;
    public string? TranslationsJson { get; set; }
    public ShopEntity Shop { get; set; } = null!;
}
