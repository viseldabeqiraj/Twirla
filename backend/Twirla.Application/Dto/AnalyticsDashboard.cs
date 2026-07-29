namespace Twirla.Application.Dto;

/// <summary>Per-day activity point used by the analytics dashboard chart/funnel/KPIs.</summary>
public record DailyMetricPoint(string Date, int Visits, int Plays, int Dm, int Redeemed);

/// <summary>Number of game starts per game mode.</summary>
public record GameModeCount(string Mode, int Count);

/// <summary>Number of coupons per derived prize label (e.g. "20%", "Dhuratë").</summary>
public record PrizeCount(string Label, int Count);

/// <summary>A single recent win row for the dashboard table.</summary>
public record RecentWin(DateTimeOffset Time, string? Mode, string Prize, string Code, bool Redeemed);

/// <summary>
/// Raw coupon projection returned by the repository. The service turns these
/// into <see cref="PrizeCount"/> and <see cref="RecentWin"/> results.
/// </summary>
public record CouponSummary(string Code, DateTimeOffset GeneratedAt, DateTimeOffset? RedeemedAt, string? Mode);

/// <summary>Everything the per-shop analytics dashboard needs in one payload.</summary>
public record AnalyticsDashboard(
    IReadOnlyList<DailyMetricPoint> Daily,
    IReadOnlyList<PrizeCount> Prizes,
    IReadOnlyList<GameModeCount> Games,
    IReadOnlyList<RecentWin> Recent);
