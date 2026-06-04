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
}
