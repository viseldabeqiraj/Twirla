namespace Twirla.Application.Dto;

public record AnalyticsEventRequest(
    string Event,
    string? VisitorId,
    string? SessionId,
    decimal? Value,
    string? Mode,
    string? CouponCode
);
