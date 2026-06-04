using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;

namespace Twirla.Infrastructure.Persistence;

/// <summary>Used by <c>dotnet ef</c> at design time (migrations).</summary>
public class TwirlaDbContextFactory : IDesignTimeDbContextFactory<TwirlaDbContext>
{
    public TwirlaDbContext CreateDbContext(string[] args)
    {
        var connectionString = Environment.GetEnvironmentVariable("DATABASE_URL")
            ?? ResolveSqliteConnectionString();

        var options = new DbContextOptionsBuilder<TwirlaDbContext>()
            .UseSqlite(connectionString, sqlite =>
                sqlite.MigrationsAssembly(typeof(TwirlaDbContext).Assembly.GetName().Name))
            .Options;

        return new TwirlaDbContext(options);
    }

    /// <summary>SQLite file lives next to the API project (<c>backend/Twirla.Api/twirla.db</c>).</summary>
    internal static string ResolveSqliteConnectionString()
    {
        var apiDir = Path.GetFullPath(Path.Combine(AppContext.BaseDirectory, "..", "..", "..", "Twirla.Api"));
        if (!Directory.Exists(apiDir))
            apiDir = Path.GetFullPath(Path.Combine(Directory.GetCurrentDirectory(), "..", "Twirla.Api"));
        var dbPath = Path.Combine(apiDir, "twirla.db");
        return $"Data Source={dbPath}";
    }
}
