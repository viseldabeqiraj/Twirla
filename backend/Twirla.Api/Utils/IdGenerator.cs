using System.Security.Cryptography;
using System.Text;

namespace Twirla.Api.Utils;

public static class IdGenerator
{
    private const string Characters = "abcdefghijklmnopqrstuvwxyz0123456789";
    private const int IdLength = 12;

    /// <summary>
    /// Generates a unique alphanumeric ID of the specified length
    /// </summary>
    public static string GenerateUniqueId(int length = IdLength)
    {
        var random = RandomNumberGenerator.Create();
        var result = new StringBuilder(length);
        var bytes = new byte[length];
        
        random.GetBytes(bytes);
        
        for (int i = 0; i < length; i++)
        {
            result.Append(Characters[bytes[i] % Characters.Length]);
        }
        
        return result.ToString();
    }

    /// <summary>
    /// Generates a shop ID in the format: shopName-uniqueId
    /// </summary>
    public static string GenerateShopId(string shopName, int uniqueIdLength = IdLength)
    {
        var cleanName = shopName.ToLowerInvariant()
            .Replace(" ", "")
            .Replace("-", "")
            .Replace("_", "");
        
        return $"{cleanName}-{GenerateUniqueId(uniqueIdLength)}";
    }
}

