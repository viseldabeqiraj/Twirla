namespace Twirla.Infrastructure.Seeding;

/// <summary>Loads data from private local files into the database (optional analytics/coupon JSONL).</summary>
public sealed class TwirlaDataSeeder
{
    private readonly ShopCatalogSeeder _shops;
    private readonly LegacyJsonlSeeder _jsonl;

    public TwirlaDataSeeder(ShopCatalogSeeder shops, LegacyJsonlSeeder jsonl)
    {
        _shops = shops;
        _jsonl = jsonl;
    }

    public async Task RunAsync(CancellationToken cancellationToken = default)
    {
        await _shops.TryImportFromLocalFileAsync(cancellationToken);
        await _jsonl.ImportAnalyticsAsync(cancellationToken);
        await _jsonl.ImportCouponsAsync(cancellationToken);
    }
}
