# Twirla API

Clean Architecture: Domain → Application → Infrastructure → Api.

Database: see [DATABASE.md](../../../DATABASE.md). **Runtime = SQLite only.** Optional private `Data/shops.json` (gitignored) for `dotnet run -- --seed`.

Run: `dotnet run --project Twirla.Api`

Admin: `GET /api/admin/shops/{slug}/summary?token=...` (token is stored in the database, never returned on public `/api/config` routes).
