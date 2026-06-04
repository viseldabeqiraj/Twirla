namespace Twirla.Infrastructure.Persistence.Entities;

public class ShopCampaignProductEntity
{
    public int Id { get; set; }
    public string ShopId { get; set; } = string.Empty;
    public int SortOrder { get; set; }
    public string? ProductId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? Price { get; set; }
    public string? ImageUrl { get; set; }
    public string? CtaLabel { get; set; }
    public string? CtaUrl { get; set; }
    public ShopCampaignEntity Campaign { get; set; } = null!;
}
