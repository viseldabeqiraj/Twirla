namespace Twirla.Infrastructure.Persistence.Entities;

public class ShopWheelEntity
{
    public string ShopId { get; set; } = string.Empty;
    public bool AllowRepeatSpins { get; set; }
    public ICollection<ShopWheelPrizeEntity> Prizes { get; set; } = new List<ShopWheelPrizeEntity>();
    public ShopEntity Shop { get; set; } = null!;
}
