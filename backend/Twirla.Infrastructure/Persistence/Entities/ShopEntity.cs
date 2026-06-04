namespace Twirla.Infrastructure.Persistence.Entities;

public class ShopEntity
{
    public string ShopId { get; set; } = string.Empty;
    public string? Slug { get; set; }
    public string? Name { get; set; }
    public string? AdminToken { get; set; }
    public bool Enabled { get; set; } = true;
    public DateTimeOffset? ExpiresAt { get; set; }
    public int PlayCooldownHours { get; set; } = 24;
    public string? Mode { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
    public DateTimeOffset UpdatedAt { get; set; }

    public ShopBrandingEntity? Branding { get; set; }
    public ShopTextEntity? Text { get; set; }
    public ShopCtaEntity? Cta { get; set; }
    public ShopWheelEntity? Wheel { get; set; }
    public ShopTapHeartsEntity? TapHearts { get; set; }
    public ShopScratchEntity? Scratch { get; set; }
    public ShopCountdownEntity? Countdown { get; set; }
    public ShopMemoryEntity? Memory { get; set; }
    public ShopRunnerGameEntity? RunnerGame { get; set; }
    public ShopCampaignEntity? Campaign { get; set; }

    public ICollection<AnalyticsEventEntity> AnalyticsEvents { get; set; } = new List<AnalyticsEventEntity>();
    public ICollection<CouponEntity> Coupons { get; set; } = new List<CouponEntity>();
}
