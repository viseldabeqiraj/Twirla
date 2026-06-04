using Twirla.Application.Interfaces;
using Twirla.Domain.Entities;

namespace Twirla.Infrastructure.Services;

public class CouponService : ICouponService
{
    private readonly ICouponRepository _coupons;
    private readonly IAnalyticsService _analytics;

    public CouponService(ICouponRepository coupons, IAnalyticsService analytics)
    {
        _coupons = coupons;
        _analytics = analytics;
    }

    public CouponRecord? FindCoupon(string shopId, string couponCode) =>
        _coupons.FindCoupon(shopId, couponCode);

    public (bool Success, string? Error) RedeemCoupon(string shopId, string couponCode, decimal orderValue)
    {
        var result = _coupons.RedeemCoupon(shopId, couponCode, orderValue);
        if (!result.Success)
            return result;

        var code = couponCode.Trim();
        _analytics.AppendEvent(shopId, new AnalyticsEventRecord { Event = AnalyticsEventTypes.CouponRedeemed, CouponCode = code });
        _analytics.AppendEvent(shopId, new AnalyticsEventRecord { Event = AnalyticsEventTypes.PurchaseAttributed, Value = orderValue, CouponCode = code });
        return (true, null);
    }

    public void AddCoupon(string shopId, string couponCode)
    {
        _coupons.AddCoupon(shopId, couponCode);
        _analytics.AppendEvent(shopId, new AnalyticsEventRecord { Event = AnalyticsEventTypes.CouponGenerated, CouponCode = couponCode.Trim() });
    }
}
