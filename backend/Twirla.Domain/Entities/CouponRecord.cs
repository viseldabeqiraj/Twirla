namespace Twirla.Domain.Entities;

public class CouponRecord
{
    public string CouponCode { get; set; } = string.Empty;
    public string ShopId { get; set; } = string.Empty;
    public string GeneratedAtUtc { get; set; } = string.Empty;
    public string? RedeemedAtUtc { get; set; }
    public decimal? OrderValue { get; set; }
}
