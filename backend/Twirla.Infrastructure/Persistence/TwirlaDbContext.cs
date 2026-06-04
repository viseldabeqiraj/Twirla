using Microsoft.EntityFrameworkCore;
using Twirla.Infrastructure.Persistence.Entities;

namespace Twirla.Infrastructure.Persistence;

public class TwirlaDbContext : DbContext
{
    public TwirlaDbContext(DbContextOptions<TwirlaDbContext> options) : base(options) { }

    public DbSet<ShopEntity> Shops => Set<ShopEntity>();
    public DbSet<AnalyticsEventEntity> AnalyticsEvents => Set<AnalyticsEventEntity>();
    public DbSet<CouponEntity> Coupons => Set<CouponEntity>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.ConfigureShopAggregate();

        modelBuilder.Entity<AnalyticsEventEntity>(e =>
        {
            e.ToTable("analytics_events");
            e.HasKey(x => x.Id);
            e.Property(x => x.Id).HasColumnName("id").ValueGeneratedOnAdd();
            e.Property(x => x.ShopId).HasColumnName("shop_id");
            e.Property(x => x.Event).HasColumnName("event").HasMaxLength(64);
            e.Property(x => x.TimestampUtc).HasColumnName("timestamp_utc");
            e.Property(x => x.VisitorId).HasColumnName("visitor_id").HasMaxLength(128);
            e.Property(x => x.SessionId).HasColumnName("session_id").HasMaxLength(128);
            e.Property(x => x.Value).HasColumnName("value").HasPrecision(18, 2);
            e.Property(x => x.Mode).HasColumnName("mode").HasMaxLength(64);
            e.Property(x => x.CouponCode).HasColumnName("coupon_code").HasMaxLength(64);
            e.HasIndex(x => new { x.ShopId, x.TimestampUtc });
            e.HasIndex(x => new { x.ShopId, x.Event });
            e.HasOne(x => x.Shop).WithMany(s => s.AnalyticsEvents).HasForeignKey(x => x.ShopId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<CouponEntity>(e =>
        {
            e.ToTable("coupons");
            e.HasKey(x => x.Id);
            e.Property(x => x.Id).HasColumnName("id").ValueGeneratedOnAdd();
            e.Property(x => x.ShopId).HasColumnName("shop_id");
            e.Property(x => x.CouponCode).HasColumnName("coupon_code").HasMaxLength(64);
            e.Property(x => x.GeneratedAtUtc).HasColumnName("generated_at_utc");
            e.Property(x => x.RedeemedAtUtc).HasColumnName("redeemed_at_utc");
            e.Property(x => x.OrderValue).HasColumnName("order_value").HasPrecision(18, 2);
            e.HasIndex(x => new { x.ShopId, x.CouponCode }).IsUnique();
            e.HasOne(x => x.Shop).WithMany(s => s.Coupons).HasForeignKey(x => x.ShopId)
                .OnDelete(DeleteBehavior.Cascade);
        });
    }

    public override int SaveChanges()
    {
        StampTimestamps();
        return base.SaveChanges();
    }

    public override Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        StampTimestamps();
        return base.SaveChangesAsync(cancellationToken);
    }

    private void StampTimestamps()
    {
        var now = DateTimeOffset.UtcNow;
        foreach (var entry in ChangeTracker.Entries<ShopEntity>())
        {
            if (entry.State == EntityState.Added)
                entry.Entity.CreatedAt = now;
            if (entry.State is EntityState.Added or EntityState.Modified)
                entry.Entity.UpdatedAt = now;
        }
    }
}
