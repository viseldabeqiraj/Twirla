using System.Globalization;
using Microsoft.EntityFrameworkCore;
using Twirla.Application.Dto;
using Twirla.Application.Interfaces;
using Twirla.Domain.Entities;
using Twirla.Infrastructure.Persistence.Entities;

namespace Twirla.Infrastructure.Persistence;

public sealed class EfAnalyticsRepository : IAnalyticsRepository
{
    private readonly TwirlaDbContext _db;

    public EfAnalyticsRepository(TwirlaDbContext db) => _db = db;

    public void AppendEvent(string shopId, AnalyticsEventRecord record)
    {
        record.TimestampUtc = DateTime.UtcNow.ToString("O");
        _db.AnalyticsEvents.Add(new AnalyticsEventEntity
        {
            Id = Guid.NewGuid(),
            ShopId = shopId,
            Event = record.Event,
            TimestampUtc = DateTimeOffset.UtcNow,
            VisitorId = record.VisitorId,
            SessionId = record.SessionId,
            Value = record.Value,
            Mode = record.Mode,
            CouponCode = record.CouponCode
        });
        _db.SaveChanges();
    }

    public AdminAnalyticsSummary GetSummary(string shopId)
    {
        var events = _db.AnalyticsEvents.AsNoTracking()
            .Where(e => e.ShopId == shopId)
            .Select(e => new { e.Event, e.VisitorId, e.Value })
            .ToList();

        var visitorIds = new HashSet<string>(StringComparer.OrdinalIgnoreCase);
        long impressions = 0, starts = 0, finishes = 0, rewardsWon = 0, rewardsGenerated = 0, couponsGenerated = 0,
            couponsRedeemed = 0, codesCopied = 0, ctaClicks = 0;
        decimal attributedRevenue = 0;

        foreach (var e in events)
        {
            if (!string.IsNullOrEmpty(e.VisitorId))
                visitorIds.Add(e.VisitorId);

            switch (e.Event)
            {
                case AnalyticsEventTypes.PageView: impressions++; break;
                case AnalyticsEventTypes.GameStart: starts++; break;
                case AnalyticsEventTypes.GameFinish: finishes++; break;
                case AnalyticsEventTypes.RewardWon: rewardsWon++; break;
                case AnalyticsEventTypes.RewardGenerated: rewardsGenerated++; break;
                case AnalyticsEventTypes.CouponGenerated: couponsGenerated++; break;
                case AnalyticsEventTypes.CouponRedeemed: couponsRedeemed++; break;
                case AnalyticsEventTypes.PurchaseAttributed: attributedRevenue += e.Value ?? 0; break;
                case AnalyticsEventTypes.CodeCopied: codesCopied++; break;
                case AnalyticsEventTypes.CtaClicked: ctaClicks++; break;
            }
        }

        return new AdminAnalyticsSummary
        {
            UniqueVisitors = visitorIds.Count,
            Impressions = impressions,
            Starts = starts,
            Finishes = finishes,
            RewardsWon = rewardsWon,
            RewardsGenerated = rewardsGenerated,
            CouponsGenerated = couponsGenerated,
            CouponsRedeemed = couponsRedeemed,
            CodesCopied = codesCopied,
            CtaClicks = ctaClicks,
            AttributedRevenue = attributedRevenue
        };
    }

    public IReadOnlyList<DailyRevenuePoint> GetDailyAttributedRevenue(string shopId)
    {
        return _db.AnalyticsEvents.AsNoTracking()
            .Where(e => e.ShopId == shopId
                && e.Event == AnalyticsEventTypes.PurchaseAttributed
                && e.Value != null)
            .AsEnumerable()
            .GroupBy(e =>
            {
                var dt = e.TimestampUtc.UtcDateTime;
                return dt.ToString("yyyy-MM-dd", CultureInfo.InvariantCulture);
            })
            .OrderBy(g => g.Key)
            .Select(g => new DailyRevenuePoint(g.Key, g.Sum(x => x.Value!.Value)))
            .ToList();
    }

    public IReadOnlyList<DailyMetricPoint> GetDailyMetrics(string shopId)
    {
        var events = _db.AnalyticsEvents.AsNoTracking()
            .Where(e => e.ShopId == shopId)
            .Select(e => new { e.Event, e.VisitorId, e.TimestampUtc })
            .AsEnumerable()
            .ToList();

        var redeemedAt = _db.Coupons.AsNoTracking()
            .Where(c => c.ShopId == shopId && c.RedeemedAtUtc != null)
            .Select(c => c.RedeemedAtUtc!.Value)
            .AsEnumerable()
            .ToList();

        var days = new Dictionary<string, DayAgg>();
        DayAgg Day(string key)
        {
            if (!days.TryGetValue(key, out var a)) { a = new DayAgg(); days[key] = a; }
            return a;
        }

        foreach (var e in events)
        {
            var key = e.TimestampUtc.UtcDateTime.ToString("yyyy-MM-dd", CultureInfo.InvariantCulture);
            var agg = Day(key);
            if (!string.IsNullOrEmpty(e.VisitorId)) agg.Visitors.Add(e.VisitorId!);
            if (e.Event == AnalyticsEventTypes.GameStart) agg.Plays++;
            if (e.Event == AnalyticsEventTypes.CtaClicked) agg.Dm++;
        }

        foreach (var r in redeemedAt)
            Day(r.UtcDateTime.ToString("yyyy-MM-dd", CultureInfo.InvariantCulture)).Redeemed++;

        return days.OrderBy(kv => kv.Key)
            .Select(kv => new DailyMetricPoint(
                kv.Key, kv.Value.Visitors.Count, kv.Value.Plays, kv.Value.Dm, kv.Value.Redeemed))
            .ToList();
    }

    public IReadOnlyList<GameModeCount> GetGameSplit(string shopId)
    {
        return _db.AnalyticsEvents.AsNoTracking()
            .Where(e => e.ShopId == shopId
                && e.Event == AnalyticsEventTypes.GameStart
                && e.Mode != null)
            .AsEnumerable()
            .GroupBy(e => e.Mode!)
            .Select(g => new GameModeCount(g.Key, g.Count()))
            .OrderByDescending(x => x.Count)
            .ToList();
    }

    public IReadOnlyList<CouponSummary> GetCouponSummaries(string shopId)
    {
        var codeToMode = _db.AnalyticsEvents.AsNoTracking()
            .Where(e => e.ShopId == shopId && e.CouponCode != null && e.Mode != null)
            .Select(e => new { e.CouponCode, e.Mode })
            .AsEnumerable()
            .GroupBy(e => e.CouponCode!, StringComparer.OrdinalIgnoreCase)
            .ToDictionary(g => g.Key, g => g.First().Mode, StringComparer.OrdinalIgnoreCase);

        return _db.Coupons.AsNoTracking()
            .Where(c => c.ShopId == shopId)
            .Select(c => new { c.CouponCode, c.GeneratedAtUtc, c.RedeemedAtUtc })
            .AsEnumerable()
            .OrderByDescending(c => c.GeneratedAtUtc)
            .Select(c => new CouponSummary(
                c.CouponCode,
                c.GeneratedAtUtc,
                c.RedeemedAtUtc,
                codeToMode.TryGetValue(c.CouponCode, out var mode) ? mode : null))
            .ToList();
    }

    /// <summary>Mutable per-day accumulator used while aggregating events in memory.</summary>
    private sealed class DayAgg
    {
        public HashSet<string> Visitors { get; } = new(StringComparer.OrdinalIgnoreCase);
        public int Plays;
        public int Dm;
        public int Redeemed;
    }
}
