namespace Twirla.Infrastructure.Persistence.Entities;

public class ShopCampaignTrustBadgeEntity
{
    public int Id { get; set; }
    public string ShopId { get; set; } = string.Empty;
    public int SortOrder { get; set; }
    public string Label { get; set; } = string.Empty;
    public string? Icon { get; set; }
    public ShopCampaignEntity Campaign { get; set; } = null!;
}
