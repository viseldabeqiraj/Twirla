namespace Twirla.Infrastructure.Persistence.Entities;

public class CouponEntity
{
    public Guid Id { get; set; }
    public string ShopId { get; set; } = string.Empty;
    public string CouponCode { get; set; } = string.Empty;
    public DateTimeOffset GeneratedAtUtc { get; set; }
    public DateTimeOffset? RedeemedAtUtc { get; set; }
    public decimal? OrderValue { get; set; }

    public ShopEntity Shop { get; set; } = null!;
}
