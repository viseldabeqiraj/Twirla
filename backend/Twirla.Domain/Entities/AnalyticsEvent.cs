namespace Twirla.Domain.Entities;

public static class AnalyticsEventTypes
{
    public const string PageView = "page_view";
    public const string GameStart = "game_start";
    public const string GameFinish = "game_finish";
    public const string RewardWon = "reward_won";
    public const string CouponGenerated = "coupon_generated";
    public const string CouponRedeemed = "coupon_redeemed";
    public const string PurchaseAttributed = "purchase_attributed";
}

public class AnalyticsEventRecord
{
    public string Event { get; set; } = string.Empty;
    public string TimestampUtc { get; set; } = string.Empty;
    public string? VisitorId { get; set; }
    public decimal? Value { get; set; }
    public string? Mode { get; set; }
    public string? CouponCode { get; set; }
}

public class AdminAnalyticsSummary
{
    public long UniqueVisitors { get; set; }
    public long Impressions { get; set; }
    public long Starts { get; set; }
    public long Finishes { get; set; }
    public long RewardsWon { get; set; }
    public long CouponsGenerated { get; set; }
    public long CouponsRedeemed { get; set; }
    public decimal AttributedRevenue { get; set; }
}
