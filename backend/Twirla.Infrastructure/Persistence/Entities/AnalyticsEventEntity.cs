namespace Twirla.Infrastructure.Persistence.Entities;

public class AnalyticsEventEntity
{
    public Guid Id { get; set; }
    public string ShopId { get; set; } = string.Empty;
    public string Event { get; set; } = string.Empty;
    public DateTimeOffset TimestampUtc { get; set; }
    public string? VisitorId { get; set; }
    public string? SessionId { get; set; }
    public decimal? Value { get; set; }
    public string? Mode { get; set; }
    public string? CouponCode { get; set; }

    public ShopEntity Shop { get; set; } = null!;
}
