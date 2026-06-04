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
}
