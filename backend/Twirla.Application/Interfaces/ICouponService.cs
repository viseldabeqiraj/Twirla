using Twirla.Domain.Entities;

namespace Twirla.Application.Interfaces;

public interface ICouponService
{
    CouponRecord? FindCoupon(string shopId, string couponCode);
    (bool Success, string? Error) RedeemCoupon(string shopId, string couponCode, decimal orderValue);
    void AddCoupon(string shopId, string couponCode);
}
