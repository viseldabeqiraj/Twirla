using System.Security.Cryptography;
using System.Text;
using Microsoft.EntityFrameworkCore;
using Twirla.Domain.Entities;
using Twirla.Infrastructure.Persistence;
using Twirla.Infrastructure.Persistence.Entities;

namespace Twirla.Infrastructure.Services;

public sealed class ShopBuilderService
{
    private const string DefaultPublicOrigin = "https://twirla.app";
    private static readonly (string ModeKey, string Path, Func<ShopConfig, bool> HasGame)[] GameModes =
    [
        ("Runner", "runner", c => c.RunnerGame != null),
        ("Wheel", "wheel", c => c.Wheel != null),
        ("TapHearts", "taphearts", c => c.TapHearts != null),
        ("Scratch", "scratch", c => c.Scratch != null),
        ("Countdown", "countdown", c => c.Countdown != null),
        ("MemoryMatch", "memory", c => c.Memory != null),
    ];

    private readonly TwirlaDbContext _db;

    public ShopBuilderService(TwirlaDbContext db) => _db = db;

    public async Task<IReadOnlyList<ShopListItem>> ListShopsAsync(CancellationToken cancellationToken = default)
    {
        var rows = await _db.Shops.AsNoTracking()
            .WithFullConfig()
            .OrderBy(s => s.Name ?? s.Slug ?? s.ShopId)
            .ToListAsync(cancellationToken);

        return rows.Select(row =>
        {
            var config = ShopAggregateMapper.ToDomain(row);
            return new ShopListItem(
                config.ShopId,
                config.Slug,
                config.Name ?? config.Branding.BrandName,
                config.Branding.BrandName,
                config.Enabled != false,
                config.ExpiresAt,
                config.Branding.PrimaryColor,
                row.UpdatedAt,
                DescribeGameModes(config));
        }).ToList();
    }

    public async Task<ShopConfig?> GetShopAsync(string shopId, CancellationToken cancellationToken = default)
    {
        var row = await _db.Shops.AsNoTracking()
            .WithFullConfig()
            .FirstOrDefaultAsync(s => s.ShopId == shopId, cancellationToken);
        return row == null ? null : ShopAggregateMapper.ToDomain(row);
    }

    public async Task<CreateShopResult> CreateShopAsync(ShopConfig config, string? publicWebOrigin, CancellationToken cancellationToken = default)
    {
        Normalize(config, preserveAdminToken: false);

        if (string.IsNullOrWhiteSpace(config.ShopId))
            throw new ShopBuilderException("shopId is required.");
        if (string.IsNullOrWhiteSpace(config.Slug))
            throw new ShopBuilderException("slug is required.");

        var shopId = config.ShopId.Trim();
        var slug = config.Slug.Trim();

        if (await _db.Shops.AnyAsync(s => s.ShopId == shopId, cancellationToken))
            throw new ShopBuilderException($"Shop id \"{shopId}\" already exists.");

        if (await _db.Shops.AnyAsync(s => s.Slug != null && s.Slug.ToLower() == slug.ToLower(), cancellationToken))
            throw new ShopBuilderException($"Slug \"{slug}\" is already in use.");

        await SaveShopAsync(config, shopId, cancellationToken);
        var origin = NormalizeOrigin(publicWebOrigin);
        return BuildResult(config, origin);
    }

    /// <summary>Replaces an existing shop row (same shopId). Keeps adminToken when omitted in payload.</summary>
    public async Task<CreateShopResult> UpdateShopAsync(ShopConfig config, string? publicWebOrigin, CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(config.ShopId))
            throw new ShopBuilderException("shopId is required.");

        var shopId = config.ShopId.Trim();
        var existing = await _db.Shops.AsNoTracking().FirstOrDefaultAsync(s => s.ShopId == shopId, cancellationToken);
        if (existing == null)
            throw new ShopBuilderException($"Shop id \"{shopId}\" was not found.");

        if (string.IsNullOrWhiteSpace(config.AdminToken) && !string.IsNullOrWhiteSpace(existing.AdminToken))
            config.AdminToken = existing.AdminToken;

        Normalize(config, preserveAdminToken: true);

        if (string.IsNullOrWhiteSpace(config.Slug))
            throw new ShopBuilderException("slug is required.");

        var slug = config.Slug.Trim();
        var slugTaken = await _db.Shops.AnyAsync(
            s => s.ShopId != shopId && s.Slug != null && s.Slug.ToLower() == slug.ToLower(),
            cancellationToken);
        if (slugTaken)
            throw new ShopBuilderException($"Slug \"{slug}\" is already in use by another shop.");

        await SaveShopAsync(config, shopId, cancellationToken);
        var origin = NormalizeOrigin(publicWebOrigin);
        return BuildResult(config, origin);
    }

    private async Task SaveShopAsync(ShopConfig config, string shopId, CancellationToken cancellationToken)
    {
        // Load full graph so EF deletes child rows (branding, wheel prizes, etc.) before re-insert.
        var existing = await _db.Shops.WithFullConfig().FirstOrDefaultAsync(s => s.ShopId == shopId, cancellationToken);
        if (existing != null)
        {
            _db.Shops.Remove(existing);
            await _db.SaveChangesAsync(cancellationToken);
        }

        var entity = new ShopEntity { ShopId = shopId };
        ShopAggregateMapper.ApplyGraph(entity, config);
        _db.Shops.Add(entity);
        await _db.SaveChangesAsync(cancellationToken);
    }

    public static CreateShopResult BuildResult(ShopConfig config, string origin)
    {
        var slug = config.Slug!.Trim();
        var token = config.AdminToken ?? string.Empty;
        var expSlug = (config.Campaign?.ExperiencesSlug ?? slug).Trim();
        var expId = config.Campaign?.ExperiencesUniqueId?.Trim() ?? "main";
        var experiencePathShopId = $"{expSlug}-{expId}";

        var gameUrls = GameModes
            .Where(g => g.HasGame(config))
            .Select(g => new ShopGameUrl(g.ModeKey, $"{origin}/{g.Path}/{Uri.EscapeDataString(expSlug)}/{Uri.EscapeDataString(expId)}"))
            .ToList();

        return new CreateShopResult(
            config,
            token,
            $"{origin}/shop/{Uri.EscapeDataString(slug)}",
            $"{origin}/admin/{Uri.EscapeDataString(slug)}?token={Uri.EscapeDataString(token)}",
            experiencePathShopId,
            gameUrls);
    }

    private static void Normalize(ShopConfig config, bool preserveAdminToken)
    {
        config.ShopId = config.ShopId?.Trim() ?? string.Empty;
        config.Slug = config.Slug?.Trim();
        config.Name = string.IsNullOrWhiteSpace(config.Name) ? null : config.Name.Trim();
        if (string.IsNullOrWhiteSpace(config.AdminToken) && !preserveAdminToken)
            config.AdminToken = GenerateToken(32);
        else if (!string.IsNullOrWhiteSpace(config.AdminToken))
            config.AdminToken = config.AdminToken.Trim();
        config.Enabled ??= true;
        config.PlayCooldownHours ??= 0;
        config.CouponValidDays ??= 7;
        config.Branding ??= new BrandingConfig();
        config.Text ??= new TextConfig();
        config.Cta ??= new CtaConfig();

        if (string.IsNullOrWhiteSpace(config.Branding.PrimaryColor))
            config.Branding.PrimaryColor = "#db2777";
        if (string.IsNullOrWhiteSpace(config.Branding.SecondaryColor))
            config.Branding.SecondaryColor = "#be185d";
        if (string.IsNullOrWhiteSpace(config.Branding.BrandName))
            config.Branding.BrandName = config.Name ?? config.Slug;

        config.Campaign ??= new ShopCampaignConfig();
        if (string.IsNullOrWhiteSpace(config.Campaign.ExperiencesSlug))
            config.Campaign.ExperiencesSlug = config.Slug;
        if (string.IsNullOrWhiteSpace(config.Campaign.ExperiencesUniqueId))
        {
            var dash = config.ShopId.LastIndexOf('-');
            var tail = dash >= 0 ? config.ShopId[(dash + 1)..] : "main";
            config.Campaign.ExperiencesUniqueId = tail.Length > 0 ? tail : "main";
        }

        if (config.Wheel == null && config.TapHearts == null && config.Scratch == null
            && config.Countdown == null && config.Memory == null && config.RunnerGame == null)
        {
            config.Wheel = DefaultWheel();
        }
    }

    private static WheelConfig DefaultWheel() => new()
    {
        AllowRepeatSpins = false,
        Prizes =
        [
            new PrizeConfig { Label = "10% Off", Weight = 50, Description = "On your next order" },
            new PrizeConfig { Label = "Try Again", Weight = 50, IsWinning = false, Description = "Come back later" }
        ]
    };

    private static string GenerateToken(int length)
    {
        const string chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
        var bytes = new byte[length];
        RandomNumberGenerator.Fill(bytes);
        var sb = new StringBuilder(length);
        for (var i = 0; i < length; i++)
            sb.Append(chars[bytes[i] % chars.Length]);
        return sb.ToString();
    }

    private static string NormalizeOrigin(string? origin)
    {
        if (string.IsNullOrWhiteSpace(origin))
            return DefaultPublicOrigin;
        return origin.Trim().TrimEnd('/');
    }

    private static IReadOnlyList<string> DescribeGameModes(ShopConfig config) =>
        GameModes.Where(g => g.HasGame(config)).Select(g => g.ModeKey).ToList();
}

public sealed record ShopListItem(
    string ShopId,
    string? Slug,
    string? Name,
    string? BrandName,
    bool Enabled,
    string? ExpiresAt,
    string PrimaryColor,
    DateTimeOffset UpdatedAt,
    IReadOnlyList<string> GameModes);

public sealed class ShopBuilderException(string message) : Exception(message);

public sealed record ShopGameUrl(string Mode, string Url);

public sealed record CreateShopResult(
    ShopConfig Shop,
    string AdminToken,
    string LandingUrl,
    string AdminUrl,
    string ExperiencePathShopId,
    IReadOnlyList<ShopGameUrl> GameUrls);
