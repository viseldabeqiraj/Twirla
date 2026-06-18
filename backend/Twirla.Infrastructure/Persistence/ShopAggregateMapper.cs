using Twirla.Domain.Entities;
using Twirla.Infrastructure.Persistence.Entities;

namespace Twirla.Infrastructure.Persistence;

internal static class ShopAggregateMapper
{
    public static ShopConfig ToDomain(ShopEntity entity)
    {
        var config = new ShopConfig
        {
            ShopId = entity.ShopId,
            Slug = entity.Slug,
            Name = entity.Name,
            AdminToken = entity.AdminToken,
            Enabled = entity.Enabled,
            ExpiresAt = entity.ExpiresAt?.ToString("O"),
            PlayCooldownHours = entity.PlayCooldownHours,
            Mode = entity.Mode,
            Branding = MapBranding(entity.Branding),
            Text = MapText(entity.Text),
            Cta = entity.Cta == null ? new CtaConfig() : new CtaConfig { Url = entity.Cta.Url },
            Wheel = MapWheel(entity.Wheel),
            TapHearts = MapTapHearts(entity.TapHearts),
            Scratch = MapScratch(entity.Scratch),
            Countdown = MapCountdown(entity.Countdown),
            Memory = MapMemory(entity.Memory),
            RunnerGame = MapRunner(entity.RunnerGame),
            Campaign = MapCampaign(entity.Campaign)
        };
        return config;
    }

    public static void ApplyGraph(ShopEntity entity, ShopConfig config)
    {
        entity.Slug = config.Slug;
        entity.Name = config.Name;
        entity.AdminToken = config.AdminToken;
        entity.Enabled = config.Enabled != false;
        entity.ExpiresAt = ParseExpires(config.ExpiresAt);
        entity.PlayCooldownHours = config.PlayCooldownHours ?? 24;
        entity.Mode = config.Mode;

        entity.Branding = MapBrandingEntity(config.Branding, entity.ShopId);
        entity.Text = MapTextEntity(config.Text, entity.ShopId);
        entity.Cta = string.IsNullOrWhiteSpace(config.Cta?.Url)
            ? null
            : new ShopCtaEntity { ShopId = entity.ShopId, Url = config.Cta.Url };
        entity.Wheel = MapWheelEntity(config.Wheel, entity.ShopId);
        entity.TapHearts = MapTapHeartsEntity(config.TapHearts, entity.ShopId);
        entity.Scratch = MapScratchEntity(config.Scratch, entity.ShopId);
        entity.Countdown = MapCountdownEntity(config.Countdown, entity.ShopId);
        entity.Memory = MapMemoryEntity(config.Memory, entity.ShopId);
        entity.RunnerGame = MapRunnerEntity(config.RunnerGame, entity.ShopId);
        entity.Campaign = MapCampaignEntity(config.Campaign, entity.ShopId);
    }

    private static DateTimeOffset? ParseExpires(string? raw) =>
        string.IsNullOrWhiteSpace(raw) || !DateTimeOffset.TryParse(raw, out var dto) ? null : dto.ToUniversalTime();

    private static BrandingConfig MapBranding(ShopBrandingEntity? b)
    {
        if (b == null) return new BrandingConfig();
        return new BrandingConfig
        {
            PrimaryColor = b.PrimaryColor,
            SecondaryColor = b.SecondaryColor,
            LogoUrl = b.LogoUrl,
            BrandName = b.BrandName,
            AccentColor = b.AccentColor,
            BackgroundMode = b.BackgroundMode,
            LogoBackgroundColor = b.LogoBackgroundColor,
            SpotPalette = HasSpot(b) ? new SpotPaletteConfig { Deep = b.SpotDeep, Muted = b.SpotMuted, Wash = b.SpotWash, Accent = b.SpotAccent } : null,
            Theme = HasTheme(b) ? new ThemeConfig
            {
                BackgroundPattern = b.ThemeBackgroundPattern,
                SurfaceStyle = b.ThemeSurfaceStyle,
                AmbientMotion = b.ThemeAmbientMotion,
                FontFamily = b.ThemeFontFamily,
                BorderRadius = b.ThemeBorderRadius,
                ButtonRadius = b.ThemeButtonRadius,
                AmbientParticles = b.ThemeParticlesEnabled == true ? new AmbientParticlesConfig
                {
                    Enabled = true,
                    Shape = b.ThemeParticlesShape,
                    Density = b.ThemeParticlesDensity,
                    Color = b.ThemeParticlesColor,
                    AccentColor = b.ThemeParticlesAccentColor
                } : null
            } : null
        };
    }

    private static bool HasSpot(ShopBrandingEntity b) =>
        b.SpotDeep != null || b.SpotMuted != null || b.SpotWash != null || b.SpotAccent != null;

    private static bool HasTheme(ShopBrandingEntity b) =>
        b.ThemeBackgroundPattern != null || b.ThemeSurfaceStyle != null || b.ThemeAmbientMotion != null
        || b.ThemeFontFamily != null || b.ThemeBorderRadius != null || b.ThemeButtonRadius != null
        || b.ThemeParticlesEnabled == true;

    private static TextConfig MapText(ShopTextEntity? t)
    {
        if (t == null) return new TextConfig();
        return new TextConfig
        {
            Title = t.Title,
            Subtitle = t.Subtitle,
            CtaText = t.CtaText,
            ResultTitle = t.ResultTitle,
            ResultSubtitle = t.ResultSubtitle,
            MaxDiscountPercent = t.MaxDiscountPercent,
            Translations = ShopJsonHelper.Deserialize<Dictionary<string, TextConfig>>(t.TranslationsJson)
        };
    }

    private static WheelConfig? MapWheel(ShopWheelEntity? w)
    {
        if (w == null) return null;
        return new WheelConfig
        {
            AllowRepeatSpins = w.AllowRepeatSpins,
            Prizes = w.Prizes.OrderBy(p => p.SortOrder).Select(p => new PrizeConfig
            {
                Label = p.Label,
                Weight = p.Weight,
                IconUrl = p.IconUrl,
                Description = p.Description,
                IsWinning = p.IsWinning,
                Translations = ShopJsonHelper.Deserialize<Dictionary<string, PrizeConfig>>(p.TranslationsJson)
            }).ToList()
        };
    }

    private static TapHeartsConfig? MapTapHearts(ShopTapHeartsEntity? t)
    {
        if (t == null) return null;
        return new TapHeartsConfig
        {
            HeartsToTap = t.HeartsToTap,
            HeartColor = t.HeartColor,
            RevealText = t.RevealText,
            RevealSubtitle = t.RevealSubtitle,
            Translations = ShopJsonHelper.Deserialize<Dictionary<string, TapHeartsConfig>>(t.TranslationsJson),
            Outcomes = t.Outcomes.OrderBy(o => o.SortOrder).Select(o => new TapHeartsOutcome
            {
                Headline = o.Headline,
                Description = o.Description,
                Weight = o.Weight,
                IsNoWin = o.IsNoWin
            }).ToList()
        };
    }

    private static ScratchConfig? MapScratch(ShopScratchEntity? s) =>
        s == null ? null : new ScratchConfig
        {
            OverlayColor = s.OverlayColor,
            OverlayText = s.OverlayText,
            RevealText = s.RevealText,
            RevealSubtitle = s.RevealSubtitle,
            Translations = ShopJsonHelper.Deserialize<Dictionary<string, ScratchConfig>>(s.TranslationsJson)
        };

    private static CountdownConfig? MapCountdown(ShopCountdownEntity? c) =>
        c == null ? null : new CountdownConfig
        {
            EndAt = c.EndAt,
            EndMessage = c.EndMessage,
            ShowCtaBeforeEnd = c.ShowCtaBeforeEnd,
            Translations = ShopJsonHelper.Deserialize<Dictionary<string, CountdownConfig>>(c.TranslationsJson)
        };

    private static MemoryMatchConfig? MapMemory(ShopMemoryEntity? m) =>
        m == null ? null : new MemoryMatchConfig
        {
            PairCount = m.PairCount,
            RevealText = m.RevealText,
            RevealSubtitle = m.RevealSubtitle,
            PairLabels = ShopJsonHelper.Deserialize<List<string>>(m.PairLabelsJson),
            TimeLimitSeconds = m.TimeLimitSeconds,
            MaxMistakes = m.MaxMistakes,
            Translations = ShopJsonHelper.Deserialize<Dictionary<string, MemoryMatchConfig>>(m.TranslationsJson)
        };

    private static RunnerGameConfig? MapRunner(ShopRunnerGameEntity? r) =>
        r == null ? null : new RunnerGameConfig
        {
            Outcomes = r.Outcomes.OrderBy(o => o.SortOrder).Select(o => new RunnerGameOutcome
            {
                Headline = o.Headline,
                Body = o.Body,
                Weight = o.Weight,
                IsNoWin = o.IsNoWin
            }).ToList()
        };

    private static ShopCampaignConfig? MapCampaign(ShopCampaignEntity? c)
    {
        if (c == null) return null;
        return new ShopCampaignConfig
        {
            LayoutTemplate = c.LayoutTemplate,
            FontPairId = c.FontPairId,
            AccentColor = c.AccentColor,
            FeaturedSectionTitle = c.FeaturedSectionTitle,
            GamesSectionTitle = c.GamesSectionTitle,
            FeaturedGame = c.FeaturedGame,
            EnabledGameModes = ShopJsonHelper.Deserialize<List<string>>(c.EnabledGameModesJson),
            ExperiencesSlug = c.ExperiencesSlug,
            ExperiencesUniqueId = c.ExperiencesUniqueId,
            Hero = HasHero(c) ? new CampaignHeroConfig
            {
                Headline = c.HeroHeadline,
                Tagline = c.HeroTagline,
                CtaLabel = c.HeroCtaLabel,
                CtaUrl = c.HeroCtaUrl,
                BackgroundStyle = c.HeroBackgroundStyle,
                BackgroundImageUrl = c.HeroBackgroundImageUrl,
                BackgroundImageOverlay = c.HeroBackgroundImageOverlay,
                BackgroundPattern = c.HeroBackgroundPattern
            } : null,
            ValueProposition = c.ValueHeadline != null || c.ValueBody != null
                ? new CampaignValuePropositionConfig { Headline = c.ValueHeadline, Body = c.ValueBody } : null,
            HowToOrder = c.HowToOrderHeading != null || c.HowToOrderBody != null
                ? new CampaignHowToOrderConfig
                {
                    Heading = c.HowToOrderHeading,
                    Body = c.HowToOrderBody,
                    PrimaryCtaLabel = c.HowToOrderPrimaryCtaLabel,
                    PrimaryCtaUrl = c.HowToOrderPrimaryCtaUrl
                } : null,
            About = c.AboutWhatWeSell != null || c.AboutAboutUs != null
                ? new CampaignAboutConfig
                {
                    WhatWeSell = c.AboutWhatWeSell,
                    AboutUs = c.AboutAboutUs,
                    City = c.AboutCity,
                    Country = c.AboutCountry,
                    PhysicalAddress = c.AboutPhysicalAddress,
                    OwnerPhotoUrl = c.AboutOwnerPhotoUrl
                } : null,
            Social = HasSocial(c) ? new CampaignSocialConfig
            {
                Instagram = c.SocialInstagram,
                Tiktok = c.SocialTiktok,
                Whatsapp = c.SocialWhatsapp,
                Website = c.SocialWebsite,
                Email = c.SocialEmail,
                Phone = c.SocialPhone
            } : null,
            FeaturedProducts = c.FeaturedProducts.OrderBy(p => p.SortOrder).Select(p => new CampaignFeaturedProductConfig
            {
                Id = p.ProductId,
                Title = p.Title,
                Description = p.Description,
                Price = p.Price,
                ImageUrl = p.ImageUrl,
                CtaLabel = p.CtaLabel,
                CtaUrl = p.CtaUrl
            }).ToList(),
            Testimonials = c.Testimonials.OrderBy(t => t.SortOrder).Select(t => new CampaignTestimonialConfig
            {
                Quote = t.Quote,
                Author = t.Author,
                Role = t.Role
            }).ToList(),
            TrustBadges = c.TrustBadges.OrderBy(t => t.SortOrder).Select(t => new CampaignTrustBadgeConfig
            {
                Label = t.Label,
                Icon = t.Icon
            }).ToList(),
            Faq = c.Faq.OrderBy(f => f.SortOrder).Select(f => new CampaignFaqConfig
            {
                Question = f.Question,
                Answer = f.Answer
            }).ToList(),
            ParticlesBackground = c.ParticlesEnabled == true ? new CampaignParticlesConfig
            {
                Enabled = true,
                Count = c.ParticlesCount,
                LinkDistance = c.ParticlesLinkDistance,
                DotSize = c.ParticlesDotSize,
                Speed = c.ParticlesSpeed,
                Color = c.ParticlesColor,
                AccentColor = c.ParticlesAccentColor
            } : null,
            SpotPalette = c.SpotDeep != null ? new SpotPaletteConfig
            {
                Deep = c.SpotDeep,
                Muted = c.SpotMuted,
                Wash = c.SpotWash,
                Accent = c.SpotAccent
            } : null,
            Translations = CampaignTranslationSanitizer.Sanitize(
                ShopJsonHelper.Deserialize<Dictionary<string, ShopCampaignConfig>>(c.TranslationsJson))
        };
    }

    private static bool HasHero(ShopCampaignEntity c) =>
        c.HeroHeadline != null || c.HeroTagline != null || c.HeroCtaLabel != null || c.HeroCtaUrl != null
        || c.HeroBackgroundStyle != null || !string.IsNullOrWhiteSpace(c.HeroBackgroundImageUrl)
        || c.HeroBackgroundImageOverlay != null || c.HeroBackgroundPattern != null;

    private static bool HasSocial(ShopCampaignEntity c) =>
        c.SocialInstagram != null || c.SocialWebsite != null || c.SocialWhatsapp != null
        || c.SocialTiktok != null || c.SocialEmail != null || c.SocialPhone != null;

    private static ShopBrandingEntity MapBrandingEntity(BrandingConfig b, string shopId)
    {
        var e = new ShopBrandingEntity
        {
            ShopId = shopId,
            PrimaryColor = b.PrimaryColor,
            SecondaryColor = b.SecondaryColor,
            LogoUrl = b.LogoUrl,
            BrandName = b.BrandName,
            AccentColor = b.AccentColor,
            BackgroundMode = b.BackgroundMode,
            LogoBackgroundColor = b.LogoBackgroundColor
        };
        if (b.SpotPalette != null)
        {
            e.SpotDeep = b.SpotPalette.Deep;
            e.SpotMuted = b.SpotPalette.Muted;
            e.SpotWash = b.SpotPalette.Wash;
            e.SpotAccent = b.SpotPalette.Accent;
        }
        if (b.Theme != null)
        {
            e.ThemeBackgroundPattern = b.Theme.BackgroundPattern;
            e.ThemeSurfaceStyle = b.Theme.SurfaceStyle;
            e.ThemeAmbientMotion = b.Theme.AmbientMotion;
            e.ThemeFontFamily = b.Theme.FontFamily;
            e.ThemeBorderRadius = b.Theme.BorderRadius;
            e.ThemeButtonRadius = b.Theme.ButtonRadius;
            if (b.Theme.AmbientParticles?.Enabled == true)
            {
                e.ThemeParticlesEnabled = true;
                e.ThemeParticlesShape = b.Theme.AmbientParticles.Shape;
                e.ThemeParticlesDensity = b.Theme.AmbientParticles.Density;
                e.ThemeParticlesColor = b.Theme.AmbientParticles.Color;
                e.ThemeParticlesAccentColor = b.Theme.AmbientParticles.AccentColor;
            }
        }
        return e;
    }

    private static ShopTextEntity MapTextEntity(TextConfig t, string shopId) => new()
    {
        ShopId = shopId,
        Title = t.Title,
        Subtitle = t.Subtitle,
        CtaText = t.CtaText,
        ResultTitle = t.ResultTitle,
        ResultSubtitle = t.ResultSubtitle,
        MaxDiscountPercent = t.MaxDiscountPercent,
        TranslationsJson = ShopJsonHelper.Serialize(t.Translations)
    };

    private static ShopWheelEntity? MapWheelEntity(WheelConfig? w, string shopId)
    {
        if (w == null) return null;
        var entity = new ShopWheelEntity { ShopId = shopId, AllowRepeatSpins = w.AllowRepeatSpins };
        var i = 0;
        foreach (var p in w.Prizes)
        {
            entity.Prizes.Add(new ShopWheelPrizeEntity
            {
                ShopId = shopId,
                SortOrder = i++,
                Label = p.Label,
                Weight = p.Weight,
                IconUrl = p.IconUrl,
                Description = p.Description,
                IsWinning = p.IsWinning,
                TranslationsJson = ShopJsonHelper.Serialize(p.Translations)
            });
        }
        return entity;
    }

    private static ShopTapHeartsEntity? MapTapHeartsEntity(TapHeartsConfig? t, string shopId)
    {
        if (t == null) return null;
        var entity = new ShopTapHeartsEntity
        {
            ShopId = shopId,
            HeartsToTap = t.HeartsToTap,
            HeartColor = t.HeartColor,
            RevealText = t.RevealText,
            RevealSubtitle = t.RevealSubtitle,
            TranslationsJson = ShopJsonHelper.Serialize(t.Translations)
        };
        if (t.Outcomes != null)
        {
            var i = 0;
            foreach (var o in t.Outcomes)
            {
                entity.Outcomes.Add(new ShopTapHeartsOutcomeEntity
                {
                    ShopId = shopId,
                    SortOrder = i++,
                    Headline = o.Headline,
                    Description = o.Description,
                    Weight = o.Weight,
                    IsNoWin = o.IsNoWin
                });
            }
        }
        return entity;
    }

    private static ShopScratchEntity? MapScratchEntity(ScratchConfig? s, string shopId) =>
        s == null ? null : new ShopScratchEntity
        {
            ShopId = shopId,
            OverlayColor = s.OverlayColor,
            OverlayText = s.OverlayText,
            RevealText = s.RevealText,
            RevealSubtitle = s.RevealSubtitle,
            TranslationsJson = ShopJsonHelper.Serialize(s.Translations)
        };

    private static ShopCountdownEntity? MapCountdownEntity(CountdownConfig? c, string shopId) =>
        c == null ? null : new ShopCountdownEntity
        {
            ShopId = shopId,
            EndAt = c.EndAt,
            EndMessage = c.EndMessage,
            ShowCtaBeforeEnd = c.ShowCtaBeforeEnd,
            TranslationsJson = ShopJsonHelper.Serialize(c.Translations)
        };

    private static ShopMemoryEntity? MapMemoryEntity(MemoryMatchConfig? m, string shopId) =>
        m == null ? null : new ShopMemoryEntity
        {
            ShopId = shopId,
            PairCount = m.PairCount,
            RevealText = m.RevealText,
            RevealSubtitle = m.RevealSubtitle,
            PairLabelsJson = ShopJsonHelper.Serialize(m.PairLabels),
            TimeLimitSeconds = m.TimeLimitSeconds,
            MaxMistakes = m.MaxMistakes,
            TranslationsJson = ShopJsonHelper.Serialize(m.Translations)
        };

    private static ShopRunnerGameEntity? MapRunnerEntity(RunnerGameConfig? r, string shopId)
    {
        if (r == null) return null;
        var entity = new ShopRunnerGameEntity { ShopId = shopId };
        if (r.Outcomes == null) return entity;
        var i = 0;
        foreach (var o in r.Outcomes)
        {
            entity.Outcomes.Add(new ShopRunnerOutcomeEntity
            {
                ShopId = shopId,
                SortOrder = i++,
                Headline = o.Headline,
                Body = o.Body,
                Weight = o.Weight,
                IsNoWin = o.IsNoWin
            });
        }
        return entity;
    }

    private static ShopCampaignEntity? MapCampaignEntity(ShopCampaignConfig? c, string shopId)
    {
        if (c == null) return null;
        var entity = new ShopCampaignEntity
        {
            ShopId = shopId,
            LayoutTemplate = c.LayoutTemplate,
            FontPairId = c.FontPairId,
            AccentColor = c.AccentColor,
            FeaturedSectionTitle = c.FeaturedSectionTitle,
            GamesSectionTitle = c.GamesSectionTitle,
            FeaturedGame = c.FeaturedGame,
            EnabledGameModesJson = ShopJsonHelper.Serialize(c.EnabledGameModes),
            ExperiencesSlug = c.ExperiencesSlug,
            ExperiencesUniqueId = c.ExperiencesUniqueId,
            TranslationsJson = ShopJsonHelper.Serialize(CampaignTranslationSanitizer.Sanitize(c.Translations))
        };
        if (c.Hero != null)
        {
            entity.HeroHeadline = c.Hero.Headline;
            entity.HeroTagline = c.Hero.Tagline;
            entity.HeroCtaLabel = c.Hero.CtaLabel;
            entity.HeroCtaUrl = c.Hero.CtaUrl;
            entity.HeroBackgroundStyle = c.Hero.BackgroundStyle;
            entity.HeroBackgroundImageUrl = c.Hero.BackgroundImageUrl;
            entity.HeroBackgroundImageOverlay = c.Hero.BackgroundImageOverlay;
            entity.HeroBackgroundPattern = c.Hero.BackgroundPattern;
        }
        if (c.ValueProposition != null)
        {
            entity.ValueHeadline = c.ValueProposition.Headline;
            entity.ValueBody = c.ValueProposition.Body;
        }
        if (c.HowToOrder != null)
        {
            entity.HowToOrderHeading = c.HowToOrder.Heading;
            entity.HowToOrderBody = c.HowToOrder.Body;
            entity.HowToOrderPrimaryCtaLabel = c.HowToOrder.PrimaryCtaLabel;
            entity.HowToOrderPrimaryCtaUrl = c.HowToOrder.PrimaryCtaUrl;
        }
        if (c.About != null)
        {
            entity.AboutWhatWeSell = c.About.WhatWeSell;
            entity.AboutAboutUs = c.About.AboutUs;
            entity.AboutCity = c.About.City;
            entity.AboutCountry = c.About.Country;
            entity.AboutPhysicalAddress = c.About.PhysicalAddress;
            entity.AboutOwnerPhotoUrl = c.About.OwnerPhotoUrl;
        }
        if (c.Social != null)
        {
            entity.SocialInstagram = c.Social.Instagram;
            entity.SocialTiktok = c.Social.Tiktok;
            entity.SocialWhatsapp = c.Social.Whatsapp;
            entity.SocialWebsite = c.Social.Website;
            entity.SocialEmail = c.Social.Email;
            entity.SocialPhone = c.Social.Phone;
        }
        if (c.ParticlesBackground?.Enabled == true)
        {
            entity.ParticlesEnabled = true;
            entity.ParticlesCount = c.ParticlesBackground.Count;
            entity.ParticlesLinkDistance = c.ParticlesBackground.LinkDistance;
            entity.ParticlesDotSize = c.ParticlesBackground.DotSize;
            entity.ParticlesSpeed = c.ParticlesBackground.Speed;
            entity.ParticlesColor = c.ParticlesBackground.Color;
            entity.ParticlesAccentColor = c.ParticlesBackground.AccentColor;
        }
        if (c.SpotPalette != null)
        {
            entity.SpotDeep = c.SpotPalette.Deep;
            entity.SpotMuted = c.SpotPalette.Muted;
            entity.SpotWash = c.SpotPalette.Wash;
            entity.SpotAccent = c.SpotPalette.Accent;
        }
        var pi = 0;
        foreach (var p in c.FeaturedProducts ?? [])
        {
            entity.FeaturedProducts.Add(new ShopCampaignProductEntity
            {
                ShopId = shopId,
                SortOrder = pi++,
                ProductId = p.Id,
                Title = p.Title,
                Description = p.Description,
                Price = p.Price,
                ImageUrl = p.ImageUrl,
                CtaLabel = p.CtaLabel,
                CtaUrl = p.CtaUrl
            });
        }
        var ti = 0;
        foreach (var t in c.Testimonials ?? [])
        {
            entity.Testimonials.Add(new ShopCampaignTestimonialEntity
            {
                ShopId = shopId,
                SortOrder = ti++,
                Quote = t.Quote,
                Author = t.Author,
                Role = t.Role
            });
        }
        var bi = 0;
        foreach (var b in c.TrustBadges ?? [])
        {
            entity.TrustBadges.Add(new ShopCampaignTrustBadgeEntity
            {
                ShopId = shopId,
                SortOrder = bi++,
                Label = b.Label,
                Icon = b.Icon
            });
        }
        var fi = 0;
        foreach (var f in c.Faq ?? [])
        {
            entity.Faq.Add(new ShopCampaignFaqEntity
            {
                ShopId = shopId,
                SortOrder = fi++,
                Question = f.Question,
                Answer = f.Answer
            });
        }
        return entity;
    }
}
