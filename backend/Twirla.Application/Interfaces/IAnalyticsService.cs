using Twirla.Application.Dto;
using Twirla.Domain.Entities;

namespace Twirla.Application.Interfaces;

public interface IAnalyticsService
{
    void AppendEvent(string shopId, AnalyticsEventRecord record);
    AdminAnalyticsSummary GetSummary(string shopId);
    IReadOnlyList<DailyRevenuePoint> GetDailyAttributedRevenue(string shopId);
}
