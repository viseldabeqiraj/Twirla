using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Hosting;
using Twirla.Infrastructure.Persistence;
using Twirla.Infrastructure.Persistence.Entities;

namespace Twirla.Infrastructure.Seeding;

/// <summary>Optional import of analytics/coupon JSONL from Twirla.Api/Data (local/dev only).</summary>
public sealed class LegacyJsonlSeeder
{
    private readonly TwirlaDbContext _db;
    private readonly string _dataDir;

    public LegacyJsonlSeeder(TwirlaDbContext db, IHostEnvironment env)
    {
        _db = db;
        _dataDir = Path.Combine(env.ContentRootPath, "Data");
    }

    public async Task ImportAnalyticsAsync(CancellationToken cancellationToken = default)
    {
        var dir = Path.Combine(_dataDir, "Analytics");
        if (!Directory.Exists(dir)) return;

        var force = Environment.GetEnvironmentVariable("TWIRLA_SEED_FORCE_ANALYTICS") == "1";
        foreach (var file in Directory.EnumerateFiles(dir, "*.jsonl"))
        {
            var shopId = Path.GetFileNameWithoutExtension(file);
            if (!await _db.Shops.AnyAsync(s => s.ShopId == shopId, cancellationToken))
            {
                Console.WriteLine($"Skip analytics {Path.GetFileName(file)}: unknown shop_id");
                continue;
            }

            var existing = await _db.AnalyticsEvents.CountAsync(e => e.ShopId == shopId, cancellationToken);
            if (existing > 0 && !force)
            {
                Console.WriteLine($"Skip analytics {Path.GetFileName(file)}: {existing} events present");
                continue;
            }

            if (force && existing > 0)
                await _db.AnalyticsEvents.Where(e => e.ShopId == shopId).ExecuteDeleteAsync(cancellationToken);

            var inserted = 0;
            foreach (var line in await File.ReadAllLinesAsync(file, cancellationToken))
            {
                if (string.IsNullOrWhiteSpace(line)) continue;
                try
                {
                    using var ev = JsonDocument.Parse(line);
                    var root = ev.RootElement;
                    var ts = ParseTimestamp(root);
                    if (ts == null) continue;

                    _db.AnalyticsEvents.Add(new AnalyticsEventEntity
                    {
                        ShopId = shopId,
                        Event = GetString(root, "event") ?? "unknown",
                        TimestampUtc = ts.Value,
                        VisitorId = GetString(root, "visitorId"),
                        SessionId = GetString(root, "sessionId"),
                        Value = root.TryGetProperty("value", out var v) && v.TryGetDecimal(out var dec) ? dec : null,
                        Mode = GetString(root, "mode"),
                        CouponCode = GetString(root, "couponCode")
                    });
                    inserted++;
                }
                catch { /* skip bad line */ }
            }

            await _db.SaveChangesAsync(cancellationToken);
            Console.WriteLine($"Analytics {Path.GetFileName(file)}: {inserted} rows");
        }
    }

    public async Task ImportCouponsAsync(CancellationToken cancellationToken = default)
    {
        var dir = Path.Combine(_dataDir, "Coupons");
        if (!Directory.Exists(dir)) return;

        foreach (var file in Directory.EnumerateFiles(dir, "*.jsonl"))
        {
            var shopId = Path.GetFileNameWithoutExtension(file);
            foreach (var line in await File.ReadAllLinesAsync(file, cancellationToken))
            {
                if (string.IsNullOrWhiteSpace(line)) continue;
                try
                {
                    using var doc = JsonDocument.Parse(line);
                    var root = doc.RootElement;
                    var code = GetString(root, "couponCode")?.Trim();
                    if (string.IsNullOrEmpty(code)) continue;

                    var entity = await _db.Coupons.FirstOrDefaultAsync(
                        c => c.ShopId == shopId && c.CouponCode == code, cancellationToken);
                    if (entity == null)
                    {
                        entity = new CouponEntity { ShopId = shopId, CouponCode = code };
                        _db.Coupons.Add(entity);
                    }

                    entity.GeneratedAtUtc = ParseTimestamp(root, "generatedAtUtc") ?? DateTimeOffset.UtcNow;
                    entity.RedeemedAtUtc = ParseTimestamp(root, "redeemedAtUtc");
                    if (root.TryGetProperty("orderValue", out var ov) && ov.TryGetDecimal(out var order))
                        entity.OrderValue = order;
                }
                catch { /* skip */ }
            }

            await _db.SaveChangesAsync(cancellationToken);
            Console.WriteLine($"Coupons {Path.GetFileName(file)}: processed");
        }
    }

    private static string? GetString(JsonElement el, string name) =>
        el.TryGetProperty(name, out var p) && p.ValueKind == JsonValueKind.String ? p.GetString() : null;

    private static DateTimeOffset? ParseTimestamp(JsonElement root, string? propName = null)
    {
        var raw = propName != null ? GetString(root, propName) : GetString(root, "timestampUtc");
        if (string.IsNullOrWhiteSpace(raw)) return propName == null ? DateTimeOffset.UtcNow : null;
        return DateTimeOffset.TryParse(raw, out var dto) ? dto.ToUniversalTime() : null;
    }
}
