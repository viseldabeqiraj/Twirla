namespace Twirla.Infrastructure.Persistence.Entities;

public class ShopRunnerOutcomeEntity
{
    public int Id { get; set; }
    public string ShopId { get; set; } = string.Empty;
    public int SortOrder { get; set; }
    public string Headline { get; set; } = string.Empty;
    public string? Body { get; set; }
    public int Weight { get; set; }
    public bool? IsNoWin { get; set; }
    public ShopRunnerGameEntity RunnerGame { get; set; } = null!;
}
