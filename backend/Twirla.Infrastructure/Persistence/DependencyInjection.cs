using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Twirla.Application.Interfaces;

namespace Twirla.Infrastructure.Persistence;

public static class DependencyInjection
{
    public static IServiceCollection AddTwirlaPersistence(this IServiceCollection services, IConfiguration configuration)
    {
        var connectionString = configuration.GetConnectionString("Database")
            ?? configuration["DATABASE_URL"]
            ?? "Data Source=twirla.db";

        var migrationsAssembly = typeof(TwirlaDbContext).Assembly.GetName().Name!;
        services.AddDbContext<TwirlaDbContext>(options =>
            options.UseSqlite(connectionString, sqlite => sqlite.MigrationsAssembly(migrationsAssembly)));

        services.AddScoped<IShopRepository, EfShopRepository>();
        services.AddScoped<IAnalyticsRepository, EfAnalyticsRepository>();
        services.AddScoped<ICouponRepository, EfCouponRepository>();

        return services;
    }
}
