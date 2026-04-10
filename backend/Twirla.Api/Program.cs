using Twirla.Application.Interfaces;
using Twirla.Infrastructure.Services;

var builder = WebApplication.CreateBuilder(args);

// Clean Architecture: register application interfaces with infrastructure implementations
builder.Services.AddSingleton<IShopConfigService>(sp =>
    new ShopConfigService(sp.GetRequiredService<IWebHostEnvironment>()));
builder.Services.AddSingleton<IAnalyticsService>(sp =>
    new AnalyticsService(sp.GetRequiredService<IWebHostEnvironment>()));
builder.Services.AddSingleton<ICouponService>(sp =>
    new CouponService(sp.GetRequiredService<IWebHostEnvironment>(), sp.GetRequiredService<IAnalyticsService>()));
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

app.UseCors();
app.UseStaticFiles();
app.MapControllers();

app.Run();
