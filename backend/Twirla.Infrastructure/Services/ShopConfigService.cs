using System.Globalization;
using Twirla.Application.Interfaces;
using Twirla.Domain.Entities;

namespace Twirla.Infrastructure.Services;

public class ShopConfigService : IShopConfigService
{
    private readonly IShopRepository _shops;

    public ShopConfigService(IShopRepository shops) => _shops = shops;

    /// <summary>Full catalog (includes disabled/expired) for admin setup and slug resolution.</summary>
    public IReadOnlyList<ShopConfig> GetAll() => _shops.GetAll();

    public ShopConfig? GetByShopId(string shopId) =>
        TryGetByShopIdRaw(shopId) is { } c && IsShopPubliclyAccessible(c) ? c : null;

    public ShopConfig? GetBySlug(string slug) =>
        TryGetBySlugRaw(slug) is { } c && IsShopPubliclyAccessible(c) ? c : null;

    private ShopConfig? TryGetByShopIdRaw(string shopId) => _shops.GetByShopId(shopId);

    private ShopConfig? TryGetBySlugRaw(string? slug) =>
        string.IsNullOrWhiteSpace(slug) ? null : _shops.GetBySlug(slug);

    private static bool IsShopPubliclyAccessible(ShopConfig shop)
    {
        if (shop.Enabled == false)
            return false;
        return !IsPastExpiration(shop);
    }

    private static bool IsPastExpiration(ShopConfig shop)
    {
        if (string.IsNullOrWhiteSpace(shop.ExpiresAt))
            return false;
        if (!DateTimeOffset.TryParse(
                shop.ExpiresAt,
                CultureInfo.InvariantCulture,
                DateTimeStyles.AssumeUniversal | DateTimeStyles.AdjustToUniversal,
                out var expires))
            return false;
        return DateTimeOffset.UtcNow >= expires;
    }

    public ShopConfig? ValidateAdminToken(string? slug, string? token)
    {
        if (string.IsNullOrWhiteSpace(slug) || string.IsNullOrWhiteSpace(token))
            return null;
        var shop = TryGetBySlugRaw(slug);
        if (shop == null || shop.Enabled == false || string.IsNullOrWhiteSpace(shop.AdminToken))
            return null;
        return shop.AdminToken == token ? shop : null;
    }
}
