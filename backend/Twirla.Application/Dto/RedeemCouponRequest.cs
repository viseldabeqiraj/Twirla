namespace Twirla.Application.Dto;

public record RedeemCouponRequest(string? CouponCode, decimal? OrderValue);
