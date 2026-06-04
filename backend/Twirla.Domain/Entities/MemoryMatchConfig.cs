namespace Twirla.Domain.Entities;

public class MemoryMatchConfig
{
    public int PairCount { get; set; }
    public string RevealText { get; set; } = string.Empty;
    public string? RevealSubtitle { get; set; }
    public List<string>? PairLabels { get; set; }
    public int? TimeLimitSeconds { get; set; }
    public int? MaxMistakes { get; set; }
    public Dictionary<string, MemoryMatchConfig>? Translations { get; set; }
}
