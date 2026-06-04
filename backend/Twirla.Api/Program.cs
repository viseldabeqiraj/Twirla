using Microsoft.EntityFrameworkCore;
using Twirla.Application.Interfaces;
using Twirla.Infrastructure.Persistence;
using Twirla.Infrastructure.Seeding;
using Twirla.Infrastructure.Services;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddTwirlaPersistence(builder.Configuration);
builder.Services.AddScoped<ShopCatalogSeeder>();
builder.Services.AddScoped<LegacyJsonlSeeder>();
builder.Services.AddScoped<TwirlaDataSeeder>();

builder.Services.AddScoped<IShopConfigService, ShopConfigService>();
builder.Services.AddScoped<IAnalyticsService, AnalyticsService>();
builder.Services.AddScoped<ICouponService, CouponService>();
builder.Services.AddSingleton<CampaignSetupTokenService>();

builder.Services.AddControllers();

builder.Services.ConfigureHttpJsonOptions(options =>
{
    options.SerializerOptions.Converters.Add(new System.Text.Json.Serialization.JsonStringEnumConverter());
});

var app = builder.Build();

// CORS in app only — clear Azure Portal → API → CORS (platform CORS conflicts with this).
app.Use(TwirlaCorsMiddleware.Invoke);

if (args.Contains("--seed", StringComparer.OrdinalIgnoreCase))
{
    using var scope = app.Services.CreateScope();
    var db = scope.ServiceProvider.GetRequiredService<TwirlaDbContext>();
    await db.Database.MigrateAsync();
    var seeder = scope.ServiceProvider.GetRequiredService<TwirlaDataSeeder>();
    await seeder.RunAsync();
    return;
}

await DatabaseBootstrap.InitializeAsync(app.Services);

app.UseStaticFiles();
app.UseRouting();
app.MapControllers();
app.Run();

file static class TwirlaCorsMiddleware
{
    public static async Task Invoke(HttpContext context, Func<Task> next)
    {
        var origin = context.Request.Headers.Origin.ToString();
        if (IsAllowedOrigin(origin))
        {
            context.Response.Headers["Access-Control-Allow-Origin"] = origin;
            context.Response.Headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, DELETE, PATCH, OPTIONS";
            context.Response.Headers["Access-Control-Allow-Headers"] = "Content-Type, Authorization, Accept, Origin";
            context.Response.Headers["Vary"] = "Origin";
        }

        if (HttpMethods.IsOptions(context.Request.Method))
        {
            context.Response.StatusCode = StatusCodes.Status204NoContent;
            return;
        }

        await next();
    }

    private static bool IsAllowedOrigin(string? origin)
    {
        if (string.IsNullOrWhiteSpace(origin))
            return false;
        if (origin.Equals("https://twirla.app", StringComparison.OrdinalIgnoreCase)
            || origin.Equals("https://www.twirla.app", StringComparison.OrdinalIgnoreCase))
            return true;
        if (origin.EndsWith(".pages.dev", StringComparison.OrdinalIgnoreCase))
            return true;
        if (origin.StartsWith("http://localhost:", StringComparison.OrdinalIgnoreCase)
            || origin.StartsWith("https://localhost:", StringComparison.OrdinalIgnoreCase))
            return true;
        return false;
    }
}
