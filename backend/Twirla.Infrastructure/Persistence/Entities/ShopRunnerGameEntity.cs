namespace Twirla.Infrastructure.Persistence.Entities;

public class ShopRunnerGameEntity
{
    public string ShopId { get; set; } = string.Empty;
    public ICollection<ShopRunnerOutcomeEntity> Outcomes { get; set; } = new List<ShopRunnerOutcomeEntity>();
    public ShopEntity Shop { get; set; } = null!;
}
