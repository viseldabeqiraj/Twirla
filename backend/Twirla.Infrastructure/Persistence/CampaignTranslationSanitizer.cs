using Twirla.Domain.Entities;

namespace Twirla.Infrastructure.Persistence;

/// <summary>
/// Locale overlays should only override copy fields. Empty strings in saved translations
/// must not wipe base image URLs when merged on the client.
/// </summary>
internal static class CampaignTranslationSanitizer
{
    public static Dictionary<string, ShopCampaignConfig>? Sanitize(Dictionary<string, ShopCampaignConfig>? translations)
    {
        if (translations == null || translations.Count == 0)
            return translations;

        var result = new Dictionary<string, ShopCampaignConfig>(translations.Count, StringComparer.OrdinalIgnoreCase);
        foreach (var (lang, slice) in translations)
            result[lang] = SanitizeSlice(slice);
        return result;
    }

    private static ShopCampaignConfig SanitizeSlice(ShopCampaignConfig slice)
    {
        slice.Hero = SanitizeHero(slice.Hero);
        if (slice.FeaturedProducts != null)
            slice.FeaturedProducts = slice.FeaturedProducts.Select(SanitizeProduct).ToList();
        return slice;
    }

    private static CampaignHeroConfig? SanitizeHero(CampaignHeroConfig? hero)
    {
        if (hero == null) return null;
        hero.BackgroundStyle = NullIfBlank(hero.BackgroundStyle);
        hero.BackgroundImageUrl = NullIfBlank(hero.BackgroundImageUrl);
        hero.BackgroundImageOverlay = NullIfBlank(hero.BackgroundImageOverlay);
        hero.BackgroundPattern = NullIfBlank(hero.BackgroundPattern);
        return hero;
    }

    private static CampaignFeaturedProductConfig SanitizeProduct(CampaignFeaturedProductConfig product)
    {
        product.Id = NullIfBlank(product.Id);
        product.ImageUrl = NullIfBlank(product.ImageUrl);
        product.Price = NullIfBlank(product.Price);
        return product;
    }

    private static string? NullIfBlank(string? value) =>
        string.IsNullOrWhiteSpace(value) ? null : value.Trim();
}
