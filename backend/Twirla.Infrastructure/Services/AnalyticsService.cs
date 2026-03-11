using System.Collections.Concurrent;
using System.Text.Json;
using Microsoft.AspNetCore.Hosting;
using Twirla.Application.Dto;
using Twirla.Application.Interfaces;
using Twirla.Domain.Entities;

namespace Twirla.Infrastructure.Services;

public class AnalyticsService : IAnalyticsService
{
    private readonly string _dataDir;
    private static readonly JsonSerializerOptions JsonOptions = new()
    {
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
        WriteIndented = false
    };
    private static readonly ConcurrentDictionary<string, object> Locks = new();

    public AnalyticsService(IWebHostEnvironment env)
    {
        _dataDir = Path.Combine(env.ContentRootPath, "Data", "Analytics");
        Directory.CreateDirectory(_dataDir);
    }

    private string GetFilePath(string shopId) =>
        Path.Combine(_dataDir, $"{SanitizeFileName(shopId)}.jsonl");

    private static string SanitizeFileName(string id)
    {
        if (string.IsNullOrEmpty(id)) return "unknown";
        var invalid = Path.GetInvalidFileNameChars();
        return string.Join("_", id.Split(invalid, StringSplitOptions.RemoveEmptyEntries));
    }

    private static object LockFor(string path) => Locks.GetOrAdd(path, _ => new object());

    public void AppendEvent(string shopId, AnalyticsEventRecord record)
    {
        record.TimestampUtc = DateTime.UtcNow.ToString("O");
        var path = GetFilePath(shopId);
        var line = JsonSerializer.Serialize(record, JsonOptions) + Environment.NewLine;
        lock (LockFor(path))
        {
            File.AppendAllText(path, line);
        }
    }

    public AdminAnalyticsSummary GetSummary(string shopId)
    {
        var path = GetFilePath(shopId);
        if (!File.Exists(path))
            return new AdminAnalyticsSummary();

        List<AnalyticsEventRecord> events;
        lock (LockFor(path))
        {
            var lines = File.ReadAllLines(path);
            events = new List<AnalyticsEventRecord>(lines.Length);
            foreach (var line in lines)
            {
                if (string.IsNullOrWhiteSpace(line)) continue;
                try
                {
                    var ev = JsonSerializer.Deserialize<AnalyticsEventRecord>(line, JsonOptions);
                    if (ev != null) events.Add(ev);
                }
                catch { /* skip bad lines */ }
            }
        }

        var visitorIds = new HashSet<string>(StringComparer.OrdinalIgnoreCase);
        long impressions = 0, starts = 0, finishes = 0, rewardsWon = 0, couponsGenerated = 0, couponsRedeemed = 0;
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
                case AnalyticsEventTypes.CouponGenerated: couponsGenerated++; break;
                case AnalyticsEventTypes.CouponRedeemed: couponsRedeemed++; break;
                case AnalyticsEventTypes.PurchaseAttributed: attributedRevenue += e.Value ?? 0; break;
            }
        }

        return new AdminAnalyticsSummary
        {
            UniqueVisitors = visitorIds.Count,
            Impressions = impressions,
            Starts = starts,
            Finishes = finishes,
            RewardsWon = rewardsWon,
            CouponsGenerated = couponsGenerated,
            CouponsRedeemed = couponsRedeemed,
            AttributedRevenue = attributedRevenue
        };
    }

    public IReadOnlyList<DailyRevenuePoint> GetDailyAttributedRevenue(string shopId)
    {
        var path = GetFilePath(shopId);
        if (!File.Exists(path))
            return Array.Empty<DailyRevenuePoint>();

        List<AnalyticsEventRecord> events;
        lock (LockFor(path))
        {
            var lines = File.ReadAllLines(path);
            events = new List<AnalyticsEventRecord>(lines.Length);
            foreach (var line in lines)
            {
                if (string.IsNullOrWhiteSpace(line)) continue;
                try
                {
                    var ev = JsonSerializer.Deserialize<AnalyticsEventRecord>(line, JsonOptions);
                    if (ev != null && ev.Event == AnalyticsEventTypes.PurchaseAttributed && ev.Value.HasValue)
                        events.Add(ev);
                }
                catch { /* skip */ }
            }
        }

        var byDate = new Dictionary<string, decimal>(StringComparer.Ordinal);
        foreach (var e in events)
        {
            if (string.IsNullOrEmpty(e.TimestampUtc) || !e.Value.HasValue) continue;
            if (!DateTime.TryParse(e.TimestampUtc, null, System.Globalization.DateTimeStyles.RoundtripKind, out var dt))
                continue;
            var dateKey = dt.Date.ToString("yyyy-MM-dd");
            byDate.TryGetValue(dateKey, out var sum);
            byDate[dateKey] = sum + e.Value.Value;
        }

        return byDate
            .OrderBy(x => x.Key)
            .Select(x => new DailyRevenuePoint(x.Key, x.Value))
            .ToList();
    }
}
