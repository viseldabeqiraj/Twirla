namespace Twirla.Infrastructure.Persistence.Entities;

public class ShopCampaignEntity
{
    public string ShopId { get; set; } = string.Empty;
    public string? LayoutTemplate { get; set; }
    public string? FontPairId { get; set; }
    public string? AccentColor { get; set; }
    public string? FeaturedSectionTitle { get; set; }
    public string? GamesSectionTitle { get; set; }
    public string? FeaturedGame { get; set; }
    public string? EnabledGameModesJson { get; set; }
    public string? ExperiencesSlug { get; set; }
    public string? ExperiencesUniqueId { get; set; }
    public string? HeroHeadline { get; set; }
    public string? HeroTagline { get; set; }
    public string? HeroCtaLabel { get; set; }
    public string? HeroCtaUrl { get; set; }
    public string? HeroBackgroundStyle { get; set; }
    public string? HeroBackgroundImageUrl { get; set; }
    public string? HeroBackgroundImageOverlay { get; set; }
    public string? HeroBackgroundPattern { get; set; }
    public string? ValueHeadline { get; set; }
    public string? ValueBody { get; set; }
    public string? HowToOrderHeading { get; set; }
    public string? HowToOrderBody { get; set; }
    public string? HowToOrderPrimaryCtaLabel { get; set; }
    public string? HowToOrderPrimaryCtaUrl { get; set; }
    public string? AboutWhatWeSell { get; set; }
    public string? AboutAboutUs { get; set; }
    public string? AboutCity { get; set; }
    public string? AboutCountry { get; set; }
    public string? AboutPhysicalAddress { get; set; }
    public string? AboutOwnerPhotoUrl { get; set; }
    public string? SocialInstagram { get; set; }
    public string? SocialTiktok { get; set; }
    public string? SocialWhatsapp { get; set; }
    public string? SocialWebsite { get; set; }
    public string? SocialEmail { get; set; }
    public string? SocialPhone { get; set; }
    public bool? ParticlesEnabled { get; set; }
    public int? ParticlesCount { get; set; }
    public int? ParticlesLinkDistance { get; set; }
    public double? ParticlesDotSize { get; set; }
    public double? ParticlesSpeed { get; set; }
    public string? ParticlesColor { get; set; }
    public string? ParticlesAccentColor { get; set; }
    public string? SpotDeep { get; set; }
    public string? SpotMuted { get; set; }
    public string? SpotWash { get; set; }
    public string? SpotAccent { get; set; }
    public string? TranslationsJson { get; set; }
    public ICollection<ShopCampaignProductEntity> FeaturedProducts { get; set; } = new List<ShopCampaignProductEntity>();
    public ICollection<ShopCampaignTestimonialEntity> Testimonials { get; set; } = new List<ShopCampaignTestimonialEntity>();
    public ICollection<ShopCampaignTrustBadgeEntity> TrustBadges { get; set; } = new List<ShopCampaignTrustBadgeEntity>();
    public ICollection<ShopCampaignFaqEntity> Faq { get; set; } = new List<ShopCampaignFaqEntity>();
    public ShopEntity Shop { get; set; } = null!;
}
