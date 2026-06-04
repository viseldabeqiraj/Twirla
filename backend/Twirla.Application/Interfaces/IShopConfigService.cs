using Twirla.Domain.Entities;

namespace Twirla.Application.Interfaces;

public interface IShopConfigService
{
    IReadOnlyList<ShopConfig> GetAll();
    ShopConfig? GetByShopId(string shopId);
    ShopConfig? GetBySlug(string slug);
    ShopConfig? ValidateAdminToken(string? slug, string? token);
}
