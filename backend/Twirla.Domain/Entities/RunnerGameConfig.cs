namespace Twirla.Domain.Entities;

public class RunnerGameOutcome
{
    public string Headline { get; set; } = string.Empty;
    public string? Body { get; set; }
    public int Weight { get; set; }
    public bool? IsNoWin { get; set; }
}

public class RunnerGameConfig
{
    public List<RunnerGameOutcome>? Outcomes { get; set; }
}
