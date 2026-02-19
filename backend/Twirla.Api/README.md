# Twirla API

## Shop Configuration

Shops are configured in `Data/shops.json`. Each shop has a unique ID in the format: `{shopName}-{uniqueId}`

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

