using Microsoft.EntityFrameworkCore;
using Twirla.Application.Interfaces;
using Twirla.Domain.Entities;

namespace Twirla.Infrastructure.Persistence;

public sealed class EfCouponRepository : ICouponRepository
{
    private readonly TwirlaDbContext _db;

    public EfCouponRepository(TwirlaDbContext db) => _db = db;

    public CouponRecord? FindCoupon(string shopId, string couponCode)
    {
        var code = couponCode?.Trim() ?? "";
        if (string.IsNullOrEmpty(code)) return null;

        var row = _db.Coupons.AsNoTracking()
            .FirstOrDefault(c => c.ShopId == shopId && c.CouponCode.ToLower() == code.ToLower());
        return row == null ? null : ToRecord(row);
    }

    public (bool Success, string? Error) RedeemCoupon(string shopId, string couponCode, decimal orderValue)
    {
        var code = couponCode?.Trim() ?? "";
        if (string.IsNullOrEmpty(code))
            return (false, "Coupon code is required.");

        using var tx = _db.Database.BeginTransaction();
        try
        {
            var row = _db.Coupons
                .FirstOrDefault(c => c.ShopId == shopId && c.CouponCode.ToLower() == code.ToLower());

            if (row == null)
                return (false, "Coupon not found.");
            if (row.RedeemedAtUtc.HasValue)
                return (false, "Coupon has already been redeemed.");

            row.RedeemedAtUtc = DateTimeOffset.UtcNow;
            row.OrderValue = orderValue;
            _db.SaveChanges();
            tx.Commit();
            return (true, null);
        }
        catch
        {
            tx.Rollback();
            throw;
        }
    }

    public void AddCoupon(string shopId, string couponCode)
    {
        var code = couponCode.Trim();
        var exists = _db.Coupons.Any(c => c.ShopId == shopId && c.CouponCode == code);
        if (exists) return;

        _db.Coupons.Add(new Entities.CouponEntity
        {
            Id = Guid.NewGuid(),
            ShopId = shopId,
            CouponCode = code,
            GeneratedAtUtc = DateTimeOffset.UtcNow
        });
        _db.SaveChanges();
    }

    private static CouponRecord ToRecord(Entities.CouponEntity row) => new()
    {
        CouponCode = row.CouponCode,
        ShopId = row.ShopId,
        GeneratedAtUtc = row.GeneratedAtUtc.ToString("O"),
        RedeemedAtUtc = row.RedeemedAtUtc?.ToString("O"),
        OrderValue = row.OrderValue
    };
}
