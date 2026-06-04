using Microsoft.EntityFrameworkCore;
using Twirla.Infrastructure.Persistence.Entities;

namespace Twirla.Infrastructure.Persistence;

internal static class ShopModelConfiguration
{
    public static void ConfigureShopAggregate(this ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<ShopEntity>(e =>
        {
            e.ToTable("shops");
            e.HasKey(x => x.ShopId);
            e.Property(x => x.ShopId).HasColumnName("shop_id");
            e.Property(x => x.Slug).HasColumnName("slug").HasMaxLength(128);
            e.Property(x => x.Name).HasColumnName("name").HasMaxLength(256);
            e.Property(x => x.AdminToken).HasColumnName("admin_token").HasMaxLength(256);
            e.Property(x => x.Enabled).HasColumnName("enabled").HasDefaultValue(true);
            e.Property(x => x.ExpiresAt).HasColumnName("expires_at");
            e.Property(x => x.PlayCooldownHours).HasColumnName("play_cooldown_hours").HasDefaultValue(24);
            e.Property(x => x.Mode).HasColumnName("mode").HasMaxLength(32);
            e.Property(x => x.CreatedAt).HasColumnName("created_at");
            e.Property(x => x.UpdatedAt).HasColumnName("updated_at");
            e.HasIndex(x => x.Slug);

            e.HasOne(x => x.Branding).WithOne(x => x.Shop).HasForeignKey<ShopBrandingEntity>(x => x.ShopId).OnDelete(DeleteBehavior.Cascade);
            e.HasOne(x => x.Text).WithOne(x => x.Shop).HasForeignKey<ShopTextEntity>(x => x.ShopId).OnDelete(DeleteBehavior.Cascade);
            e.HasOne(x => x.Cta).WithOne(x => x.Shop).HasForeignKey<ShopCtaEntity>(x => x.ShopId).OnDelete(DeleteBehavior.Cascade);
            e.HasOne(x => x.Wheel).WithOne(x => x.Shop).HasForeignKey<ShopWheelEntity>(x => x.ShopId).OnDelete(DeleteBehavior.Cascade);
            e.HasOne(x => x.TapHearts).WithOne(x => x.Shop).HasForeignKey<ShopTapHeartsEntity>(x => x.ShopId).OnDelete(DeleteBehavior.Cascade);
            e.HasOne(x => x.Scratch).WithOne(x => x.Shop).HasForeignKey<ShopScratchEntity>(x => x.ShopId).OnDelete(DeleteBehavior.Cascade);
            e.HasOne(x => x.Countdown).WithOne(x => x.Shop).HasForeignKey<ShopCountdownEntity>(x => x.ShopId).OnDelete(DeleteBehavior.Cascade);
            e.HasOne(x => x.Memory).WithOne(x => x.Shop).HasForeignKey<ShopMemoryEntity>(x => x.ShopId).OnDelete(DeleteBehavior.Cascade);
            e.HasOne(x => x.RunnerGame).WithOne(x => x.Shop).HasForeignKey<ShopRunnerGameEntity>(x => x.ShopId).OnDelete(DeleteBehavior.Cascade);
            e.HasOne(x => x.Campaign).WithOne(x => x.Shop).HasForeignKey<ShopCampaignEntity>(x => x.ShopId).OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<ShopBrandingEntity>(e =>
        {
            e.ToTable("shop_branding");
            e.HasKey(x => x.ShopId);
            e.Property(x => x.ShopId).HasColumnName("shop_id");
            e.Property(x => x.PrimaryColor).HasColumnName("primary_color").HasMaxLength(32);
            e.Property(x => x.SecondaryColor).HasColumnName("secondary_color").HasMaxLength(32);
        });

        modelBuilder.Entity<ShopTextEntity>(e => { e.ToTable("shop_text"); e.HasKey(x => x.ShopId); e.Property(x => x.ShopId).HasColumnName("shop_id"); e.Property(x => x.TranslationsJson).HasColumnName("translations_json"); });
        modelBuilder.Entity<ShopCtaEntity>(e => { e.ToTable("shop_cta"); e.HasKey(x => x.ShopId); e.Property(x => x.ShopId).HasColumnName("shop_id"); });

        modelBuilder.Entity<ShopWheelEntity>(e =>
        {
            e.ToTable("shop_wheel");
            e.HasKey(x => x.ShopId);
            e.Property(x => x.ShopId).HasColumnName("shop_id");
            e.HasMany(x => x.Prizes).WithOne(x => x.Wheel).HasForeignKey(x => x.ShopId).OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<ShopWheelPrizeEntity>(e =>
        {
            e.ToTable("shop_wheel_prizes");
            e.HasKey(x => x.Id);
            e.Property(x => x.Id).HasColumnName("id");
            e.Property(x => x.TranslationsJson).HasColumnName("translations_json");
        });

        modelBuilder.Entity<ShopTapHeartsEntity>(e =>
        {
            e.ToTable("shop_tap_hearts");
            e.HasKey(x => x.ShopId);
            e.Property(x => x.TranslationsJson).HasColumnName("translations_json");
            e.HasMany(x => x.Outcomes).WithOne(x => x.TapHearts).HasForeignKey(x => x.ShopId).OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<ShopTapHeartsOutcomeEntity>(e => { e.ToTable("shop_tap_hearts_outcomes"); e.HasKey(x => x.Id); });

        modelBuilder.Entity<ShopScratchEntity>(e => { e.ToTable("shop_scratch"); e.HasKey(x => x.ShopId); e.Property(x => x.TranslationsJson).HasColumnName("translations_json"); });
        modelBuilder.Entity<ShopCountdownEntity>(e => { e.ToTable("shop_countdown"); e.HasKey(x => x.ShopId); e.Property(x => x.TranslationsJson).HasColumnName("translations_json"); });

        modelBuilder.Entity<ShopMemoryEntity>(e =>
        {
            e.ToTable("shop_memory");
            e.HasKey(x => x.ShopId);
            e.Property(x => x.PairLabelsJson).HasColumnName("pair_labels_json");
            e.Property(x => x.TranslationsJson).HasColumnName("translations_json");
        });

        modelBuilder.Entity<ShopRunnerGameEntity>(e =>
        {
            e.ToTable("shop_runner_game");
            e.HasKey(x => x.ShopId);
            e.HasMany(x => x.Outcomes).WithOne(x => x.RunnerGame).HasForeignKey(x => x.ShopId).OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<ShopRunnerOutcomeEntity>(e => { e.ToTable("shop_runner_outcomes"); e.HasKey(x => x.Id); });

        modelBuilder.Entity<ShopCampaignEntity>(e =>
        {
            e.ToTable("shop_campaign");
            e.HasKey(x => x.ShopId);
            e.Property(x => x.EnabledGameModesJson).HasColumnName("enabled_game_modes_json");
            e.Property(x => x.TranslationsJson).HasColumnName("translations_json");
            e.HasMany(x => x.FeaturedProducts).WithOne(x => x.Campaign).HasForeignKey(x => x.ShopId).OnDelete(DeleteBehavior.Cascade);
            e.HasMany(x => x.Testimonials).WithOne(x => x.Campaign).HasForeignKey(x => x.ShopId).OnDelete(DeleteBehavior.Cascade);
            e.HasMany(x => x.TrustBadges).WithOne(x => x.Campaign).HasForeignKey(x => x.ShopId).OnDelete(DeleteBehavior.Cascade);
            e.HasMany(x => x.Faq).WithOne(x => x.Campaign).HasForeignKey(x => x.ShopId).OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<ShopCampaignProductEntity>(e => { e.ToTable("shop_campaign_products"); e.HasKey(x => x.Id); });
        modelBuilder.Entity<ShopCampaignTestimonialEntity>(e => { e.ToTable("shop_campaign_testimonials"); e.HasKey(x => x.Id); });
        modelBuilder.Entity<ShopCampaignTrustBadgeEntity>(e => { e.ToTable("shop_campaign_trust_badges"); e.HasKey(x => x.Id); });
        modelBuilder.Entity<ShopCampaignFaqEntity>(e => { e.ToTable("shop_campaign_faq"); e.HasKey(x => x.Id); });
    }
}
