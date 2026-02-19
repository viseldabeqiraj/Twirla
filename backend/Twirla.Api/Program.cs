using Twirla.Api.Services;
using Twirla.Api.Models;

var builder = WebApplication.CreateBuilder(args);

// Add services
builder.Services.AddSingleton<ConfigService>(sp => 
    new ConfigService(sp.GetRequiredService<IWebHostEnvironment>()));
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        policy.WithOrigins("*")
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});

// Configure JSON serialization to use string enums
builder.Services.ConfigureHttpJsonOptions(options =>
{
    options.SerializerOptions.Converters.Add(new System.Text.Json.Serialization.JsonStringEnumConverter());
});

var app = builder.Build();

// Configure pipeline
app.UseCors();

// Enable static file serving for logos
app.UseStaticFiles();

// API endpoints
app.MapGet("/api/config/{shopId}", (string shopId, string? lang, ConfigService configService) =>
{
    var config = configService.GetConfig(shopId);
    if (config == null)
    {
        return Results.NotFound(new { error = "Shop configuration not found" });
    }
    
    // Apply language translation if provided
    var translatedConfig = config.GetForLanguage(lang);
    return Results.Ok(translatedConfig);
})
.WithName("GetShopConfig");

app.MapGet("/api/config/{shopId}/{mode}", (string shopId, string mode, string? lang, ConfigService configService) =>
{
    var config = configService.GetConfig(shopId);
    if (config == null)
    {
        return Results.NotFound(new { error = "Shop configuration not found" });
    }
    
    // Validate mode and check if config exists for that mode
    if (!Enum.TryParse<ExperienceMode>(mode, true, out var experienceMode))
    {
        return Results.BadRequest(new { error = $"Invalid mode: {mode}" });
    }
    
    var modeConfig = experienceMode switch
    {
        ExperienceMode.Wheel => config.Wheel != null ? config : null,
        ExperienceMode.TapHearts => config.TapHearts != null ? config : null,
        ExperienceMode.Scratch => config.Scratch != null ? config : null,
        ExperienceMode.Countdown => config.Countdown != null ? config : null,
        _ => null
    };
    
    if (modeConfig == null)
    {
        return Results.NotFound(new { error = $"Mode '{mode}' not configured for this shop" });
    }
    
    // Apply language translation if provided
    var translatedConfig = modeConfig.GetForLanguage(lang);
    return Results.Ok(translatedConfig);
})
.WithName("GetShopConfigByMode");

app.Run();

