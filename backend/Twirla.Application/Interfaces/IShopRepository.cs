using Twirla.Domain.Entities;

namespace Twirla.Application.Interfaces;

public interface IShopRepository
{
    IReadOnlyList<ShopConfig> GetAll();
    ShopConfig? GetByShopId(string shopId);
    ShopConfig? GetBySlug(string slug);
}
