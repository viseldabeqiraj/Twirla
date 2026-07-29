using Twirla.Application.Dto;
using Twirla.Application.Interfaces;
using Twirla.Domain.Entities;

namespace Twirla.Infrastructure.Services;

public class AnalyticsService : IAnalyticsService
{
    private readonly IAnalyticsRepository _repository;

    public AnalyticsService(IAnalyticsRepository repository) => _repository = repository;

    public void AppendEvent(string shopId, AnalyticsEventRecord record) =>
        _repository.AppendEvent(shopId, record);

    public AdminAnalyticsSummary GetSummary(string shopId) =>
        _repository.GetSummary(shopId);

    public IReadOnlyList<DailyRevenuePoint> GetDailyAttributedRevenue(string shopId) =>
        _repository.GetDailyAttributedRevenue(shopId);

    public AnalyticsDashboard GetDashboard(string shopId)
    {
        var daily = _repository.GetDailyMetrics(shopId);
        var games = _repository.GetGameSplit(shopId);
        var coupons = _repository.GetCouponSummaries(shopId);

        // Prize distribution: derive a human label from each coupon code, then group.
        var prizes = coupons
            .GroupBy(c => PrizeLabel(c.Code))
            .Select(g => new PrizeCount(g.Key, g.Count()))
            .OrderByDescending(p => p.Count)
            .ToList();

        // Recent wins: newest 12 coupons (repository already ordered them desc).
        var recent = coupons
            .Take(12)
            .Select(c => new RecentWin(
                c.GeneratedAt,
                c.Mode,
                PrizeLabel(c.Code),
                c.Code,
                c.RedeemedAt != null))
            .ToList();

        return new AnalyticsDashboard(daily, prizes, games, recent);
    }

    /// <summary>
    /// Derives a human prize label from a coupon code suffix, e.g.
    /// "ASTRA-0453-20" -> "20%", "ASTRA-0453-GIFT" -> "Dhuratë". Unknown -> "Tjetër".
    /// </summary>
    private static string PrizeLabel(string? code)
    {
        if (string.IsNullOrWhiteSpace(code)) return "Tjetër";
        var token = code.Split('-').Last().Trim().ToUpperInvariant();
        if (token is "GIFT" or "DHURATE" or "DHURATË" or "FREE") return "Dhuratë";
        var numeric = token.TrimEnd('%');
        if (int.TryParse(numeric, out var n) && n > 0 && n <= 100) return n + "%";
        return "Tjetër";
    }
}
