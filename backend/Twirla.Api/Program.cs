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

builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        policy.WithOrigins("*")
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});

builder.Services.ConfigureHttpJsonOptions(options =>
{
    options.SerializerOptions.Converters.Add(new System.Text.Json.Serialization.JsonStringEnumConverter());
});

var app = builder.Build();

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
app.UseCors();
app.MapControllers();
app.Run();
