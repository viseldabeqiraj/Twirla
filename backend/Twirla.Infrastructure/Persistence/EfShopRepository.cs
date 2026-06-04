using Microsoft.EntityFrameworkCore;
using Twirla.Application.Interfaces;
using Twirla.Domain.Entities;

namespace Twirla.Infrastructure.Persistence;

public sealed class EfShopRepository : IShopRepository
{
    private readonly TwirlaDbContext _db;

    public EfShopRepository(TwirlaDbContext db) => _db = db;

    public IReadOnlyList<ShopConfig> GetAll() =>
        _db.Shops.AsNoTracking()
            .WithFullConfig()
            .OrderBy(s => s.ShopId)
            .AsEnumerable()
            .Select(ShopAggregateMapper.ToDomain)
            .ToList();

    public ShopConfig? GetByShopId(string shopId)
    {
        var row = _db.Shops.AsNoTracking().WithFullConfig().FirstOrDefault(s => s.ShopId == shopId);
        return row == null ? null : ShopAggregateMapper.ToDomain(row);
    }

    public ShopConfig? GetBySlug(string slug)
    {
        var row = _db.Shops.AsNoTracking()
            .WithFullConfig()
            .FirstOrDefault(s => s.Slug != null && s.Slug.ToLower() == slug.ToLower());
        return row == null ? null : ShopAggregateMapper.ToDomain(row);
    }
}
