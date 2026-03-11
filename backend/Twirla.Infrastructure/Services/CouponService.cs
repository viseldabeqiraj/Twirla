using System.Collections.Concurrent;
using System.Text.Json;
using Microsoft.AspNetCore.Hosting;
using Twirla.Application.Interfaces;
using Twirla.Domain.Entities;

namespace Twirla.Infrastructure.Services;

public class CouponService : ICouponService
{
    private readonly string _dataDir;
    private readonly IAnalyticsService _analytics;
    private static readonly JsonSerializerOptions JsonOptions = new()
    {
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
        WriteIndented = false
    };
    private static readonly ConcurrentDictionary<string, object> Locks = new();

    public CouponService(IWebHostEnvironment env, IAnalyticsService analytics)
    {
        _dataDir = Path.Combine(env.ContentRootPath, "Data", "Coupons");
        Directory.CreateDirectory(_dataDir);
        _analytics = analytics;
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

    public CouponRecord? FindCoupon(string shopId, string couponCode)
    {
        var path = GetFilePath(shopId);
        if (!File.Exists(path)) return null;

        var code = couponCode?.Trim() ?? "";
        if (string.IsNullOrEmpty(code)) return null;

        lock (LockFor(path))
        {
            foreach (var line in File.ReadLines(path))
            {
                if (string.IsNullOrWhiteSpace(line)) continue;
                try
                {
                    var c = JsonSerializer.Deserialize<CouponRecord>(line, JsonOptions);
                    if (c != null && string.Equals(c.CouponCode, code, StringComparison.OrdinalIgnoreCase))
                        return c;
                }
                catch { /* skip */ }
            }
        }

        return null;
    }

    public (bool Success, string? Error) RedeemCoupon(string shopId, string couponCode, decimal orderValue)
    {
        var path = GetFilePath(shopId);
        var code = couponCode?.Trim() ?? "";
        if (string.IsNullOrEmpty(code))
            return (false, "Coupon code is required.");

        lock (LockFor(path))
        {
            var lines = File.Exists(path) ? File.ReadAllLines(path).ToList() : new List<string>();
            var list = new List<CouponRecord>();
            CouponRecord? toUpdate = null;
            int index = -1;

            for (int i = 0; i < lines.Count; i++)
            {
                if (string.IsNullOrWhiteSpace(lines[i])) continue;
                try
                {
                    var c = JsonSerializer.Deserialize<CouponRecord>(lines[i], JsonOptions);
                    if (c == null) continue;
                    list.Add(c);
                    if (string.Equals(c.CouponCode, code, StringComparison.OrdinalIgnoreCase))
                    {
                        if (string.IsNullOrEmpty(c.ShopId) || !string.Equals(c.ShopId, shopId, StringComparison.OrdinalIgnoreCase))
                            return (false, "Coupon belongs to another shop.");
                        if (!string.IsNullOrEmpty(c.RedeemedAtUtc))
                            return (false, "Coupon has already been redeemed.");
                        toUpdate = c;
                        index = list.Count - 1;
                    }
                }
                catch { /* skip */ }
            }

            if (toUpdate == null || index < 0)
                return (false, "Coupon not found.");

            toUpdate.RedeemedAtUtc = DateTime.UtcNow.ToString("O");
            toUpdate.OrderValue = orderValue;
            list[index] = toUpdate;

            var newContent = string.Join(Environment.NewLine, list.Select(c => JsonSerializer.Serialize(c, JsonOptions))) + Environment.NewLine;
            File.WriteAllText(path, newContent);
        }

        _analytics.AppendEvent(shopId, new AnalyticsEventRecord { Event = AnalyticsEventTypes.CouponRedeemed, CouponCode = code });
        _analytics.AppendEvent(shopId, new AnalyticsEventRecord { Event = AnalyticsEventTypes.PurchaseAttributed, Value = orderValue, CouponCode = code });

        return (true, null);
    }

    public void AddCoupon(string shopId, string couponCode)
    {
        var path = GetFilePath(shopId);
        var record = new CouponRecord
        {
            CouponCode = couponCode.Trim(),
            ShopId = shopId,
            GeneratedAtUtc = DateTime.UtcNow.ToString("O")
        };
        var line = JsonSerializer.Serialize(record, JsonOptions) + Environment.NewLine;
        lock (LockFor(path))
        {
            File.AppendAllText(path, line);
        }
        _analytics.AppendEvent(shopId, new AnalyticsEventRecord { Event = AnalyticsEventTypes.CouponGenerated, CouponCode = record.CouponCode });
    }
}
