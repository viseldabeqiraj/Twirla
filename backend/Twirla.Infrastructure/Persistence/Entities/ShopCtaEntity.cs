namespace Twirla.Infrastructure.Persistence.Entities;

public class ShopCtaEntity
{
    public string ShopId { get; set; } = string.Empty;
    public string Url { get; set; } = string.Empty;
    public ShopEntity Shop { get; set; } = null!;
}
