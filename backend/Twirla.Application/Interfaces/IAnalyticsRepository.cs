using Twirla.Application.Dto;
using Twirla.Domain.Entities;

namespace Twirla.Application.Interfaces;

public interface IAnalyticsRepository
{
    void AppendEvent(string shopId, AnalyticsEventRecord record);
    AdminAnalyticsSummary GetSummary(string shopId);
    IReadOnlyList<DailyRevenuePoint> GetDailyAttributedRevenue(string shopId);

    /// <summary>Per-day counts of unique visitors, game starts, DM clicks and redeemed coupons.</summary>
    IReadOnlyList<DailyMetricPoint> GetDailyMetrics(string shopId);

    /// <summary>Game-start counts grouped by game mode, most played first.</summary>
    IReadOnlyList<GameModeCount> GetGameSplit(string shopId);

    /// <summary>All coupons for the shop (with the mode they were won on), newest first.</summary>
    IReadOnlyList<CouponSummary> GetCouponSummaries(string shopId);
}
