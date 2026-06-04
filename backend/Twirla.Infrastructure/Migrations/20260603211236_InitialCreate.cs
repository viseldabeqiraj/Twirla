using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Twirla.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "shops",
                columns: table => new
                {
                    shop_id = table.Column<string>(type: "TEXT", nullable: false),
                    slug = table.Column<string>(type: "TEXT", maxLength: 128, nullable: true),
                    name = table.Column<string>(type: "TEXT", maxLength: 256, nullable: true),
                    admin_token = table.Column<string>(type: "TEXT", maxLength: 256, nullable: true),
                    enabled = table.Column<bool>(type: "INTEGER", nullable: false, defaultValue: true),
                    expires_at = table.Column<DateTimeOffset>(type: "TEXT", nullable: true),
                    play_cooldown_hours = table.Column<int>(type: "INTEGER", nullable: false, defaultValue: 24),
                    mode = table.Column<string>(type: "TEXT", maxLength: 32, nullable: true),
                    created_at = table.Column<DateTimeOffset>(type: "TEXT", nullable: false),
                    updated_at = table.Column<DateTimeOffset>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_shops", x => x.shop_id);
                });

            migrationBuilder.CreateTable(
                name: "analytics_events",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "TEXT", nullable: false),
                    shop_id = table.Column<string>(type: "TEXT", nullable: false),
                    @event = table.Column<string>(name: "event", type: "TEXT", maxLength: 64, nullable: false),
                    timestamp_utc = table.Column<DateTimeOffset>(type: "TEXT", nullable: false),
                    visitor_id = table.Column<string>(type: "TEXT", maxLength: 128, nullable: true),
                    session_id = table.Column<string>(type: "TEXT", maxLength: 128, nullable: true),
                    value = table.Column<decimal>(type: "TEXT", precision: 18, scale: 2, nullable: true),
                    mode = table.Column<string>(type: "TEXT", maxLength: 64, nullable: true),
                    coupon_code = table.Column<string>(type: "TEXT", maxLength: 64, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_analytics_events", x => x.id);
                    table.ForeignKey(
                        name: "FK_analytics_events_shops_shop_id",
                        column: x => x.shop_id,
                        principalTable: "shops",
                        principalColumn: "shop_id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "coupons",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "TEXT", nullable: false),
                    shop_id = table.Column<string>(type: "TEXT", nullable: false),
                    coupon_code = table.Column<string>(type: "TEXT", maxLength: 64, nullable: false),
                    generated_at_utc = table.Column<DateTimeOffset>(type: "TEXT", nullable: false),
                    redeemed_at_utc = table.Column<DateTimeOffset>(type: "TEXT", nullable: true),
                    order_value = table.Column<decimal>(type: "TEXT", precision: 18, scale: 2, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_coupons", x => x.id);
                    table.ForeignKey(
                        name: "FK_coupons_shops_shop_id",
                        column: x => x.shop_id,
                        principalTable: "shops",
                        principalColumn: "shop_id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "shop_branding",
                columns: table => new
                {
                    shop_id = table.Column<string>(type: "TEXT", nullable: false),
                    primary_color = table.Column<string>(type: "TEXT", maxLength: 32, nullable: false),
                    secondary_color = table.Column<string>(type: "TEXT", maxLength: 32, nullable: false),
                    LogoUrl = table.Column<string>(type: "TEXT", nullable: true),
                    BrandName = table.Column<string>(type: "TEXT", nullable: true),
                    AccentColor = table.Column<string>(type: "TEXT", nullable: true),
                    BackgroundMode = table.Column<string>(type: "TEXT", nullable: true),
                    LogoBackgroundColor = table.Column<string>(type: "TEXT", nullable: true),
                    SpotDeep = table.Column<string>(type: "TEXT", nullable: true),
                    SpotMuted = table.Column<string>(type: "TEXT", nullable: true),
                    SpotWash = table.Column<string>(type: "TEXT", nullable: true),
                    SpotAccent = table.Column<string>(type: "TEXT", nullable: true),
                    ThemeBackgroundPattern = table.Column<string>(type: "TEXT", nullable: true),
                    ThemeSurfaceStyle = table.Column<string>(type: "TEXT", nullable: true),
                    ThemeAmbientMotion = table.Column<string>(type: "TEXT", nullable: true),
                    ThemeFontFamily = table.Column<string>(type: "TEXT", nullable: true),
                    ThemeBorderRadius = table.Column<int>(type: "INTEGER", nullable: true),
                    ThemeButtonRadius = table.Column<int>(type: "INTEGER", nullable: true),
                    ThemeParticlesEnabled = table.Column<bool>(type: "INTEGER", nullable: true),
                    ThemeParticlesShape = table.Column<string>(type: "TEXT", nullable: true),
                    ThemeParticlesDensity = table.Column<string>(type: "TEXT", nullable: true),
                    ThemeParticlesColor = table.Column<string>(type: "TEXT", nullable: true),
                    ThemeParticlesAccentColor = table.Column<string>(type: "TEXT", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_shop_branding", x => x.shop_id);
                    table.ForeignKey(
                        name: "FK_shop_branding_shops_shop_id",
                        column: x => x.shop_id,
                        principalTable: "shops",
                        principalColumn: "shop_id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "shop_campaign",
                columns: table => new
                {
                    ShopId = table.Column<string>(type: "TEXT", nullable: false),
                    LayoutTemplate = table.Column<string>(type: "TEXT", nullable: true),
                    FontPairId = table.Column<string>(type: "TEXT", nullable: true),
                    AccentColor = table.Column<string>(type: "TEXT", nullable: true),
                    FeaturedSectionTitle = table.Column<string>(type: "TEXT", nullable: true),
                    GamesSectionTitle = table.Column<string>(type: "TEXT", nullable: true),
                    FeaturedGame = table.Column<string>(type: "TEXT", nullable: true),
                    enabled_game_modes_json = table.Column<string>(type: "TEXT", nullable: true),
                    ExperiencesSlug = table.Column<string>(type: "TEXT", nullable: true),
                    ExperiencesUniqueId = table.Column<string>(type: "TEXT", nullable: true),
                    HeroHeadline = table.Column<string>(type: "TEXT", nullable: true),
                    HeroTagline = table.Column<string>(type: "TEXT", nullable: true),
                    HeroCtaLabel = table.Column<string>(type: "TEXT", nullable: true),
                    HeroCtaUrl = table.Column<string>(type: "TEXT", nullable: true),
                    HeroBackgroundStyle = table.Column<string>(type: "TEXT", nullable: true),
                    HeroBackgroundImageUrl = table.Column<string>(type: "TEXT", nullable: true),
                    HeroBackgroundImageOverlay = table.Column<string>(type: "TEXT", nullable: true),
                    HeroBackgroundPattern = table.Column<string>(type: "TEXT", nullable: true),
                    ValueHeadline = table.Column<string>(type: "TEXT", nullable: true),
                    ValueBody = table.Column<string>(type: "TEXT", nullable: true),
                    HowToOrderHeading = table.Column<string>(type: "TEXT", nullable: true),
                    HowToOrderBody = table.Column<string>(type: "TEXT", nullable: true),
                    HowToOrderPrimaryCtaLabel = table.Column<string>(type: "TEXT", nullable: true),
                    HowToOrderPrimaryCtaUrl = table.Column<string>(type: "TEXT", nullable: true),
                    AboutWhatWeSell = table.Column<string>(type: "TEXT", nullable: true),
                    AboutAboutUs = table.Column<string>(type: "TEXT", nullable: true),
                    AboutCity = table.Column<string>(type: "TEXT", nullable: true),
                    AboutCountry = table.Column<string>(type: "TEXT", nullable: true),
                    AboutPhysicalAddress = table.Column<string>(type: "TEXT", nullable: true),
                    AboutOwnerPhotoUrl = table.Column<string>(type: "TEXT", nullable: true),
                    SocialInstagram = table.Column<string>(type: "TEXT", nullable: true),
                    SocialTiktok = table.Column<string>(type: "TEXT", nullable: true),
                    SocialWhatsapp = table.Column<string>(type: "TEXT", nullable: true),
                    SocialWebsite = table.Column<string>(type: "TEXT", nullable: true),
                    SocialEmail = table.Column<string>(type: "TEXT", nullable: true),
                    SocialPhone = table.Column<string>(type: "TEXT", nullable: true),
                    ParticlesEnabled = table.Column<bool>(type: "INTEGER", nullable: true),
                    ParticlesCount = table.Column<int>(type: "INTEGER", nullable: true),
                    ParticlesLinkDistance = table.Column<int>(type: "INTEGER", nullable: true),
                    ParticlesDotSize = table.Column<double>(type: "REAL", nullable: true),
                    ParticlesSpeed = table.Column<double>(type: "REAL", nullable: true),
                    ParticlesColor = table.Column<string>(type: "TEXT", nullable: true),
                    ParticlesAccentColor = table.Column<string>(type: "TEXT", nullable: true),
                    SpotDeep = table.Column<string>(type: "TEXT", nullable: true),
                    SpotMuted = table.Column<string>(type: "TEXT", nullable: true),
                    SpotWash = table.Column<string>(type: "TEXT", nullable: true),
                    SpotAccent = table.Column<string>(type: "TEXT", nullable: true),
                    translations_json = table.Column<string>(type: "TEXT", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_shop_campaign", x => x.ShopId);
                    table.ForeignKey(
                        name: "FK_shop_campaign_shops_ShopId",
                        column: x => x.ShopId,
                        principalTable: "shops",
                        principalColumn: "shop_id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "shop_countdown",
                columns: table => new
                {
                    ShopId = table.Column<string>(type: "TEXT", nullable: false),
                    EndAt = table.Column<string>(type: "TEXT", nullable: false),
                    EndMessage = table.Column<string>(type: "TEXT", nullable: false),
                    ShowCtaBeforeEnd = table.Column<bool>(type: "INTEGER", nullable: false),
                    translations_json = table.Column<string>(type: "TEXT", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_shop_countdown", x => x.ShopId);
                    table.ForeignKey(
                        name: "FK_shop_countdown_shops_ShopId",
                        column: x => x.ShopId,
                        principalTable: "shops",
                        principalColumn: "shop_id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "shop_cta",
                columns: table => new
                {
                    shop_id = table.Column<string>(type: "TEXT", nullable: false),
                    Url = table.Column<string>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_shop_cta", x => x.shop_id);
                    table.ForeignKey(
                        name: "FK_shop_cta_shops_shop_id",
                        column: x => x.shop_id,
                        principalTable: "shops",
                        principalColumn: "shop_id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "shop_memory",
                columns: table => new
                {
                    ShopId = table.Column<string>(type: "TEXT", nullable: false),
                    PairCount = table.Column<int>(type: "INTEGER", nullable: false),
                    RevealText = table.Column<string>(type: "TEXT", nullable: false),
                    RevealSubtitle = table.Column<string>(type: "TEXT", nullable: true),
                    pair_labels_json = table.Column<string>(type: "TEXT", nullable: true),
                    TimeLimitSeconds = table.Column<int>(type: "INTEGER", nullable: true),
                    MaxMistakes = table.Column<int>(type: "INTEGER", nullable: true),
                    translations_json = table.Column<string>(type: "TEXT", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_shop_memory", x => x.ShopId);
                    table.ForeignKey(
                        name: "FK_shop_memory_shops_ShopId",
                        column: x => x.ShopId,
                        principalTable: "shops",
                        principalColumn: "shop_id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "shop_runner_game",
                columns: table => new
                {
                    ShopId = table.Column<string>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_shop_runner_game", x => x.ShopId);
                    table.ForeignKey(
                        name: "FK_shop_runner_game_shops_ShopId",
                        column: x => x.ShopId,
                        principalTable: "shops",
                        principalColumn: "shop_id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "shop_scratch",
                columns: table => new
                {
                    ShopId = table.Column<string>(type: "TEXT", nullable: false),
                    OverlayColor = table.Column<string>(type: "TEXT", nullable: false),
                    OverlayText = table.Column<string>(type: "TEXT", nullable: false),
                    RevealText = table.Column<string>(type: "TEXT", nullable: false),
                    RevealSubtitle = table.Column<string>(type: "TEXT", nullable: true),
                    translations_json = table.Column<string>(type: "TEXT", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_shop_scratch", x => x.ShopId);
                    table.ForeignKey(
                        name: "FK_shop_scratch_shops_ShopId",
                        column: x => x.ShopId,
                        principalTable: "shops",
                        principalColumn: "shop_id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "shop_tap_hearts",
                columns: table => new
                {
                    ShopId = table.Column<string>(type: "TEXT", nullable: false),
                    HeartsToTap = table.Column<int>(type: "INTEGER", nullable: false),
                    HeartColor = table.Column<string>(type: "TEXT", nullable: false),
                    RevealText = table.Column<string>(type: "TEXT", nullable: false),
                    RevealSubtitle = table.Column<string>(type: "TEXT", nullable: true),
                    translations_json = table.Column<string>(type: "TEXT", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_shop_tap_hearts", x => x.ShopId);
                    table.ForeignKey(
                        name: "FK_shop_tap_hearts_shops_ShopId",
                        column: x => x.ShopId,
                        principalTable: "shops",
                        principalColumn: "shop_id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "shop_text",
                columns: table => new
                {
                    shop_id = table.Column<string>(type: "TEXT", nullable: false),
                    Title = table.Column<string>(type: "TEXT", nullable: false),
                    Subtitle = table.Column<string>(type: "TEXT", nullable: true),
                    CtaText = table.Column<string>(type: "TEXT", nullable: false),
                    ResultTitle = table.Column<string>(type: "TEXT", nullable: false),
                    ResultSubtitle = table.Column<string>(type: "TEXT", nullable: true),
                    MaxDiscountPercent = table.Column<int>(type: "INTEGER", nullable: true),
                    translations_json = table.Column<string>(type: "TEXT", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_shop_text", x => x.shop_id);
                    table.ForeignKey(
                        name: "FK_shop_text_shops_shop_id",
                        column: x => x.shop_id,
                        principalTable: "shops",
                        principalColumn: "shop_id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "shop_wheel",
                columns: table => new
                {
                    shop_id = table.Column<string>(type: "TEXT", nullable: false),
                    AllowRepeatSpins = table.Column<bool>(type: "INTEGER", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_shop_wheel", x => x.shop_id);
                    table.ForeignKey(
                        name: "FK_shop_wheel_shops_shop_id",
                        column: x => x.shop_id,
                        principalTable: "shops",
                        principalColumn: "shop_id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "shop_campaign_faq",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    ShopId = table.Column<string>(type: "TEXT", nullable: false),
                    SortOrder = table.Column<int>(type: "INTEGER", nullable: false),
                    Question = table.Column<string>(type: "TEXT", nullable: false),
                    Answer = table.Column<string>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_shop_campaign_faq", x => x.Id);
                    table.ForeignKey(
                        name: "FK_shop_campaign_faq_shop_campaign_ShopId",
                        column: x => x.ShopId,
                        principalTable: "shop_campaign",
                        principalColumn: "ShopId",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "shop_campaign_products",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    ShopId = table.Column<string>(type: "TEXT", nullable: false),
                    SortOrder = table.Column<int>(type: "INTEGER", nullable: false),
                    ProductId = table.Column<string>(type: "TEXT", nullable: true),
                    Title = table.Column<string>(type: "TEXT", nullable: false),
                    Description = table.Column<string>(type: "TEXT", nullable: true),
                    Price = table.Column<string>(type: "TEXT", nullable: true),
                    ImageUrl = table.Column<string>(type: "TEXT", nullable: true),
                    CtaLabel = table.Column<string>(type: "TEXT", nullable: true),
                    CtaUrl = table.Column<string>(type: "TEXT", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_shop_campaign_products", x => x.Id);
                    table.ForeignKey(
                        name: "FK_shop_campaign_products_shop_campaign_ShopId",
                        column: x => x.ShopId,
                        principalTable: "shop_campaign",
                        principalColumn: "ShopId",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "shop_campaign_testimonials",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    ShopId = table.Column<string>(type: "TEXT", nullable: false),
                    SortOrder = table.Column<int>(type: "INTEGER", nullable: false),
                    Quote = table.Column<string>(type: "TEXT", nullable: false),
                    Author = table.Column<string>(type: "TEXT", nullable: false),
                    Role = table.Column<string>(type: "TEXT", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_shop_campaign_testimonials", x => x.Id);
                    table.ForeignKey(
                        name: "FK_shop_campaign_testimonials_shop_campaign_ShopId",
                        column: x => x.ShopId,
                        principalTable: "shop_campaign",
                        principalColumn: "ShopId",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "shop_campaign_trust_badges",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    ShopId = table.Column<string>(type: "TEXT", nullable: false),
                    SortOrder = table.Column<int>(type: "INTEGER", nullable: false),
                    Label = table.Column<string>(type: "TEXT", nullable: false),
                    Icon = table.Column<string>(type: "TEXT", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_shop_campaign_trust_badges", x => x.Id);
                    table.ForeignKey(
                        name: "FK_shop_campaign_trust_badges_shop_campaign_ShopId",
                        column: x => x.ShopId,
                        principalTable: "shop_campaign",
                        principalColumn: "ShopId",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "shop_runner_outcomes",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    ShopId = table.Column<string>(type: "TEXT", nullable: false),
                    SortOrder = table.Column<int>(type: "INTEGER", nullable: false),
                    Headline = table.Column<string>(type: "TEXT", nullable: false),
                    Body = table.Column<string>(type: "TEXT", nullable: true),
                    Weight = table.Column<int>(type: "INTEGER", nullable: false),
                    IsNoWin = table.Column<bool>(type: "INTEGER", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_shop_runner_outcomes", x => x.Id);
                    table.ForeignKey(
                        name: "FK_shop_runner_outcomes_shop_runner_game_ShopId",
                        column: x => x.ShopId,
                        principalTable: "shop_runner_game",
                        principalColumn: "ShopId",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "shop_tap_hearts_outcomes",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    ShopId = table.Column<string>(type: "TEXT", nullable: false),
                    SortOrder = table.Column<int>(type: "INTEGER", nullable: false),
                    Headline = table.Column<string>(type: "TEXT", nullable: false),
                    Description = table.Column<string>(type: "TEXT", nullable: true),
                    Weight = table.Column<int>(type: "INTEGER", nullable: false),
                    IsNoWin = table.Column<bool>(type: "INTEGER", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_shop_tap_hearts_outcomes", x => x.Id);
                    table.ForeignKey(
                        name: "FK_shop_tap_hearts_outcomes_shop_tap_hearts_ShopId",
                        column: x => x.ShopId,
                        principalTable: "shop_tap_hearts",
                        principalColumn: "ShopId",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "shop_wheel_prizes",
                columns: table => new
                {
                    id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    ShopId = table.Column<string>(type: "TEXT", nullable: false),
                    SortOrder = table.Column<int>(type: "INTEGER", nullable: false),
                    Label = table.Column<string>(type: "TEXT", nullable: false),
                    Weight = table.Column<int>(type: "INTEGER", nullable: false),
                    IconUrl = table.Column<string>(type: "TEXT", nullable: true),
                    Description = table.Column<string>(type: "TEXT", nullable: true),
                    IsWinning = table.Column<bool>(type: "INTEGER", nullable: true),
                    translations_json = table.Column<string>(type: "TEXT", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_shop_wheel_prizes", x => x.id);
                    table.ForeignKey(
                        name: "FK_shop_wheel_prizes_shop_wheel_ShopId",
                        column: x => x.ShopId,
                        principalTable: "shop_wheel",
                        principalColumn: "shop_id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_analytics_events_shop_id_event",
                table: "analytics_events",
                columns: new[] { "shop_id", "event" });

            migrationBuilder.CreateIndex(
                name: "IX_analytics_events_shop_id_timestamp_utc",
                table: "analytics_events",
                columns: new[] { "shop_id", "timestamp_utc" });

            migrationBuilder.CreateIndex(
                name: "IX_coupons_shop_id_coupon_code",
                table: "coupons",
                columns: new[] { "shop_id", "coupon_code" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_shop_campaign_faq_ShopId",
                table: "shop_campaign_faq",
                column: "ShopId");

            migrationBuilder.CreateIndex(
                name: "IX_shop_campaign_products_ShopId",
                table: "shop_campaign_products",
                column: "ShopId");

            migrationBuilder.CreateIndex(
                name: "IX_shop_campaign_testimonials_ShopId",
                table: "shop_campaign_testimonials",
                column: "ShopId");

            migrationBuilder.CreateIndex(
                name: "IX_shop_campaign_trust_badges_ShopId",
                table: "shop_campaign_trust_badges",
                column: "ShopId");

            migrationBuilder.CreateIndex(
                name: "IX_shop_runner_outcomes_ShopId",
                table: "shop_runner_outcomes",
                column: "ShopId");

            migrationBuilder.CreateIndex(
                name: "IX_shop_tap_hearts_outcomes_ShopId",
                table: "shop_tap_hearts_outcomes",
                column: "ShopId");

            migrationBuilder.CreateIndex(
                name: "IX_shop_wheel_prizes_ShopId",
                table: "shop_wheel_prizes",
                column: "ShopId");

            migrationBuilder.CreateIndex(
                name: "IX_shops_slug",
                table: "shops",
                column: "slug");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "analytics_events");

            migrationBuilder.DropTable(
                name: "coupons");

            migrationBuilder.DropTable(
                name: "shop_branding");

            migrationBuilder.DropTable(
                name: "shop_campaign_faq");

            migrationBuilder.DropTable(
                name: "shop_campaign_products");

            migrationBuilder.DropTable(
                name: "shop_campaign_testimonials");

            migrationBuilder.DropTable(
                name: "shop_campaign_trust_badges");

            migrationBuilder.DropTable(
                name: "shop_countdown");

            migrationBuilder.DropTable(
                name: "shop_cta");

            migrationBuilder.DropTable(
                name: "shop_memory");

            migrationBuilder.DropTable(
                name: "shop_runner_outcomes");

            migrationBuilder.DropTable(
                name: "shop_scratch");

            migrationBuilder.DropTable(
                name: "shop_tap_hearts_outcomes");

            migrationBuilder.DropTable(
                name: "shop_text");

            migrationBuilder.DropTable(
                name: "shop_wheel_prizes");

            migrationBuilder.DropTable(
                name: "shop_campaign");

            migrationBuilder.DropTable(
                name: "shop_runner_game");

            migrationBuilder.DropTable(
                name: "shop_tap_hearts");

            migrationBuilder.DropTable(
                name: "shop_wheel");

            migrationBuilder.DropTable(
                name: "shops");
        }
    }
}
