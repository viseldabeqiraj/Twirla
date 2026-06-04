using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Hosting;
using Twirla.Domain.Entities;
using Twirla.Infrastructure.Persistence;
using Twirla.Infrastructure.Persistence.Entities;

namespace Twirla.Infrastructure.Seeding;

/// <summary>Imports shops from a local file (gitignored) into the database. Not used at runtime.</summary>
public sealed class ShopCatalogSeeder
{
    private static readonly JsonSerializerOptions ShopJsonOptions = new()
    {
        PropertyNameCaseInsensitive = true,
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase
    };

    private readonly TwirlaDbContext _db;
    private readonly string _dataDir;
    private readonly string _shopsFileName;

    public ShopCatalogSeeder(TwirlaDbContext db, IHostEnvironment env, IConfiguration configuration)
    {
        _db = db;
        _dataDir = Path.Combine(env.ContentRootPath, "Data");
        _shopsFileName = Environment.GetEnvironmentVariable("TWIRLA_SHOPS_FILE")
            ?? configuration["ShopConfig:ShopsFile"]
            ?? "shops.json";
    }

    /// <returns>True if a file was found and import ran.</returns>
    public async Task<bool> TryImportFromLocalFileAsync(CancellationToken cancellationToken = default)
    {
        var path = Path.Combine(_dataDir, _shopsFileName);
        if (!File.Exists(path))
        {
            Console.WriteLine($"No shop seed file at {path}. Shops must already be in the database.");
            return false;
        }

        var json = await File.ReadAllTextAsync(path, cancellationToken);
        using var doc = JsonDocument.Parse(json);
        if (!doc.RootElement.TryGetProperty("shops", out var shops) || shops.ValueKind != JsonValueKind.Array)
        {
            Console.WriteLine($"Shop seed file {path} has no \"shops\" array.");
            return false;
        }

        var count = 0;
        foreach (var row in shops.EnumerateArray())
        {
            var config = JsonSerializer.Deserialize<ShopConfig>(row.GetRawText(), ShopJsonOptions);
            if (config == null || string.IsNullOrWhiteSpace(config.ShopId))
                continue;

            var existing = await _db.Shops.FirstOrDefaultAsync(s => s.ShopId == config.ShopId, cancellationToken);
            if (existing != null)
                _db.Shops.Remove(existing);

            var entity = new ShopEntity { ShopId = config.ShopId };
            ShopAggregateMapper.ApplyGraph(entity, config);
            _db.Shops.Add(entity);
            count++;
        }

        await _db.SaveChangesAsync(cancellationToken);
        Console.WriteLine($"Imported {count} shops from {path} into the database.");
        return true;
    }
}
