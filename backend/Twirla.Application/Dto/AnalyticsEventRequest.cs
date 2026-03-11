namespace Twirla.Application.Dto;

public record AnalyticsEventRequest(
    string Event,
    string? VisitorId,
    decimal? Value,
    string? Mode,
    string? CouponCode
);
