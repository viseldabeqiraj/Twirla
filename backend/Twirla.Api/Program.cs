using Microsoft.EntityFrameworkCore;
using Twirla.Application.Interfaces;
using Twirla.Infrastructure.Persistence;
using Twirla.Infrastructure.Seeding;
using Twirla.Infrastructure.Services;

const string CorsPolicy = "TwirlaCors";

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

builder.Services.AddCors(options =>
{
    options.AddPolicy(CorsPolicy, policy =>
    {
        policy
            .SetIsOriginAllowed(origin =>
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
            })
            .AllowAnyHeader()
            .AllowAnyMethod();
    });
});

builder.Services.ConfigureHttpJsonOptions(options =>
{
    options.SerializerOptions.Converters.Add(new System.Text.Json.Serialization.JsonStringEnumConverter());
});

var app = builder.Build();

// CORS first so every response (including errors) gets headers.
app.UseCors(CorsPolicy);

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
app.MapControllers().RequireCors(CorsPolicy);
app.Run();
