using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;

namespace Twirla.Infrastructure.Persistence;

/// <summary>Applies EF migrations on startup. Shop data is read from the database only.</summary>
public static class DatabaseBootstrap
{
    /// <summary>Set to <c>1</c> to skip migrations (e.g. integration tests).</summary>
    public const string SkipEnvVar = "TWIRLA_SKIP_DB_BOOTSTRAP";

    public static async Task InitializeAsync(IServiceProvider services, CancellationToken cancellationToken = default)
    {
        if (Environment.GetEnvironmentVariable(SkipEnvVar) == "1")
            return;

        await using var scope = services.CreateAsyncScope();
        var db = scope.ServiceProvider.GetRequiredService<TwirlaDbContext>();
        var logger = scope.ServiceProvider.GetRequiredService<ILoggerFactory>()
            .CreateLogger(typeof(DatabaseBootstrap));

        logger.LogInformation("Applying database migrations…");
        await db.Database.MigrateAsync(cancellationToken);
        logger.LogInformation("Database migrations applied.");

        if (!await db.Shops.AnyAsync(cancellationToken))
        {
            logger.LogWarning(
                "The database has no shops yet. Copy a prepared twirla.db, or run \"dotnet run -- --seed\" " +
                "with a private Data/shops.json on the server (file is not in git).");
        }
    }
}
