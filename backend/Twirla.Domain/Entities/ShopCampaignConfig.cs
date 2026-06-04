namespace Twirla.Domain.Entities;

public class ShopCampaignConfig
{
    public string? LayoutTemplate { get; set; }
    public string? FontPairId { get; set; }
    public string? AccentColor { get; set; }
    public string? FeaturedSectionTitle { get; set; }
    public string? GamesSectionTitle { get; set; }
    public string? FeaturedGame { get; set; }
    public List<string>? EnabledGameModes { get; set; }
    public string? ExperiencesSlug { get; set; }
    public string? ExperiencesUniqueId { get; set; }
    public CampaignHeroConfig? Hero { get; set; }
    public CampaignValuePropositionConfig? ValueProposition { get; set; }
    public CampaignHowToOrderConfig? HowToOrder { get; set; }
    public CampaignAboutConfig? About { get; set; }
    public CampaignSocialConfig? Social { get; set; }
    public List<CampaignFeaturedProductConfig>? FeaturedProducts { get; set; }
    public List<CampaignTestimonialConfig>? Testimonials { get; set; }
    public List<CampaignTrustBadgeConfig>? TrustBadges { get; set; }
    public List<CampaignFaqConfig>? Faq { get; set; }
    public CampaignParticlesConfig? ParticlesBackground { get; set; }
    public SpotPaletteConfig? SpotPalette { get; set; }
    public Dictionary<string, ShopCampaignConfig>? Translations { get; set; }
}

public class CampaignHeroConfig
{
    public string? Headline { get; set; }
    public string? Tagline { get; set; }
    public string? CtaLabel { get; set; }
    public string? CtaUrl { get; set; }
    public string? BackgroundStyle { get; set; }
    public string? BackgroundImageUrl { get; set; }
    public string? BackgroundImageOverlay { get; set; }
    public string? BackgroundPattern { get; set; }
}

public class CampaignValuePropositionConfig
{
    public string? Headline { get; set; }
    public string? Body { get; set; }
}

public class CampaignHowToOrderConfig
{
    public string? Heading { get; set; }
    public string? Body { get; set; }
    public string? PrimaryCtaLabel { get; set; }
    public string? PrimaryCtaUrl { get; set; }
}

public class CampaignAboutConfig
{
    public string? WhatWeSell { get; set; }
    public string? AboutUs { get; set; }
    public string? City { get; set; }
    public string? Country { get; set; }
    public string? PhysicalAddress { get; set; }
    public string? OwnerPhotoUrl { get; set; }
}

public class CampaignSocialConfig
{
    public string? Instagram { get; set; }
    public string? Tiktok { get; set; }
    public string? Whatsapp { get; set; }
    public string? Website { get; set; }
    public string? Email { get; set; }
    public string? Phone { get; set; }
}

public class CampaignFeaturedProductConfig
{
    public string? Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? Price { get; set; }
    public string? ImageUrl { get; set; }
    public string? CtaLabel { get; set; }
    public string? CtaUrl { get; set; }
}

public class CampaignTestimonialConfig
{
    public string Quote { get; set; } = string.Empty;
    public string Author { get; set; } = string.Empty;
    public string? Role { get; set; }
}

public class CampaignTrustBadgeConfig
{
    public string Label { get; set; } = string.Empty;
    public string? Icon { get; set; }
}

public class CampaignFaqConfig
{
    public string Question { get; set; } = string.Empty;
    public string Answer { get; set; } = string.Empty;
}

public class CampaignParticlesConfig
{
    public bool? Enabled { get; set; }
    public int? Count { get; set; }
    public int? LinkDistance { get; set; }
    public double? DotSize { get; set; }
    public double? Speed { get; set; }
    public string? Color { get; set; }
    public string? AccentColor { get; set; }
}
