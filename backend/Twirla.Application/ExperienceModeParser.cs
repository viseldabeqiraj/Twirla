using Twirla.Domain.Entities;

namespace Twirla.Application;

/// <summary>Parses URL path segments (e.g. <c>memory</c>) into <see cref="ExperienceMode"/>.</summary>
public static class ExperienceModeParser
{
    public static bool TryParse(string? mode, out ExperienceMode experienceMode)
    {
        experienceMode = default;
        if (string.IsNullOrWhiteSpace(mode))
            return false;

        if (Enum.TryParse<ExperienceMode>(mode, ignoreCase: true, out experienceMode))
            return true;

        var alias = mode.Trim().ToLowerInvariant() switch
        {
            "memory" => (ExperienceMode?)ExperienceMode.MemoryMatch,
            "tap-hearts" => ExperienceMode.TapHearts,
            _ => null
        };

        if (!alias.HasValue)
            return false;

        experienceMode = alias.Value;
        return true;
    }
}
