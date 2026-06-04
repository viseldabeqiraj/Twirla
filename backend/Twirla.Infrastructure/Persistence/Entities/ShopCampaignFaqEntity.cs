namespace Twirla.Infrastructure.Persistence.Entities;

public class ShopCampaignFaqEntity
{
    public int Id { get; set; }
    public string ShopId { get; set; } = string.Empty;
    public int SortOrder { get; set; }
    public string Question { get; set; } = string.Empty;
    public string Answer { get; set; } = string.Empty;
    public ShopCampaignEntity Campaign { get; set; } = null!;
}
