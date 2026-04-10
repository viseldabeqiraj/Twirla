# Twirla API

The backend uses **Clean Architecture** and **API controllers**:

- **Twirla.Domain** – Entities (e.g. `ShopConfig`, `CouponRecord`, `AnalyticsEventRecord`, `AdminAnalyticsSummary`). No dependencies.
- **Twirla.Application** – Interfaces (`IShopConfigService`, `IAnalyticsService`, `ICouponService`) and DTOs. Depends on Domain.
- **Twirla.Infrastructure** – Implementations (file-based config, analytics JSONL, coupons JSONL). Depends on Application and Domain.
- **Twirla.Api** – Controllers and startup. Depends on Application, Domain, and Infrastructure. Registers interfaces with implementation types in `Program.cs`.

Run from the solution: `dotnet run --project Twirla.Api` (or run Twirla.Api from IDE). Admin: `GET /api/admin/shops/{slug}/summary?token=...`, `POST /api/admin/shops/{slug}/redeem-coupon?token=...`.

## Campaign setup access (shop owner form)

The SPA gate at `/setup/campaign` calls the API to verify a code; the actual form lives at `/setup/campaign/form` and requires a valid session token from the API.

Set **one** of the following (environment variables are preferred in production):

| Setting | Example |
|--------|---------|
| `TWIRLA_CAMPAIGN_SETUP_ACCESS_CODE` | Long random string you share with shop owners |
| `CampaignSetup:AccessCode` in `appsettings` / Azure config | Same |

Optional **session signing key** (if omitted, a key is derived from the access code; set this when you want to rotate the shop-facing code without invalidating signing material immediately):

| Setting | Example |
|--------|---------|
| `TWIRLA_CAMPAIGN_SETUP_SESSION_KEY` | Separate long secret |
| `CampaignSetup:SessionSigningKey` | Same |

Endpoints: `POST /api/setup/campaign/unlock` with body `{"code":"..."}` returns `{ "token", "expiresInSeconds" }`; `GET /api/setup/campaign/session` with header `Authorization: Bearer <token>` returns `200` when the token is still valid.

For local development, `Properties/launchSettings.json` sets a placeholder `TWIRLA_CAMPAIGN_SETUP_ACCESS_CODE` (change or remove it before sharing the repo or deploying).

## Shop Configuration

Shops are configured in `Data/shops.json`. Each shop has a unique ID in the format: `{shopName}-{uniqueId}`

Set `"enabled": false` on a shop row to turn off that shop everywhere the API and static `shops.json` are used (game URLs and public landing resolution). Omit `enabled` or use `true` for active shops.

### URL Format

Shops are accessible via: `/{Mode}/{shopName}/{uniqueId}`

Examples:
- `/Wheel/pinkster/a7f3b2c9d1e4`
- `/TapHearts/fashionista/x8k2m5n9p3q`
- `/Scratch/techgadgets/b4h7j1k6l8m`
- `/Countdown/beautylounge/d2f5g8h3i7j`

### Generating Unique IDs

Use the `IdGenerator` utility class to generate unique IDs:

```csharp
using Twirla.Api.Utils;

// Generate a random unique ID
string uniqueId = IdGenerator.GenerateUniqueId(); // e.g., "a7f3b2c9d1e4"

// Generate a full shop ID from shop name
string shopId = IdGenerator.GenerateShopId("Pinkster"); // e.g., "pinkster-a7f3b2c9d1e4"
```

### Adding a New Shop

1. Generate a unique ID using `IdGenerator.GenerateUniqueId()` or manually create one
2. Add the shop configuration to `Data/shops.json` with `shopId` in format: `{shopName}-{uniqueId}`
3. Restart the API for changes to take effect

### JSON Structure

```json
{
  "shops": [
    {
      "shopId": "shopname-uniqueid123",
      "mode": "Wheel",
      "branding": { ... },
      "text": { ... },
      "cta": { ... },
      "wheel": { ... }
    }
  ]
}
```

