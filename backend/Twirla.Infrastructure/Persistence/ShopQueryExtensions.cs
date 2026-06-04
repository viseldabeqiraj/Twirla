using Microsoft.EntityFrameworkCore;
using Twirla.Infrastructure.Persistence.Entities;

namespace Twirla.Infrastructure.Persistence;

internal static class ShopQueryExtensions
{
    public static IQueryable<ShopEntity> WithFullConfig(this IQueryable<ShopEntity> query) =>
        query
            .Include(s => s.Branding)
            .Include(s => s.Text)
            .Include(s => s.Cta)
            .Include(s => s.Wheel!).ThenInclude(w => w.Prizes)
            .Include(s => s.TapHearts!).ThenInclude(t => t.Outcomes)
            .Include(s => s.Scratch)
            .Include(s => s.Countdown)
            .Include(s => s.Memory)
            .Include(s => s.RunnerGame!).ThenInclude(r => r.Outcomes)
            .Include(s => s.Campaign!).ThenInclude(c => c.FeaturedProducts)
            .Include(s => s.Campaign!).ThenInclude(c => c.Testimonials)
            .Include(s => s.Campaign!).ThenInclude(c => c.TrustBadges)
            .Include(s => s.Campaign!).ThenInclude(c => c.Faq);
}
