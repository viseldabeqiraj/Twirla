using Twirla.Domain.Entities;

namespace Twirla.Application;

/// <summary>Removes secrets before shop config is sent to browsers.</summary>
public static class ShopConfigPublicExtensions
{
    public static ShopConfig ForPublicApi(this ShopConfig config)
    {
        config.AdminToken = null;
        return config;
    }
}
