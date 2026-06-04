namespace Twirla.Infrastructure.Persistence.Entities;

public class ShopCampaignTestimonialEntity
{
    public int Id { get; set; }
    public string ShopId { get; set; } = string.Empty;
    public int SortOrder { get; set; }
    public string Quote { get; set; } = string.Empty;
    public string Author { get; set; } = string.Empty;
    public string? Role { get; set; }
    public ShopCampaignEntity Campaign { get; set; } = null!;
}
