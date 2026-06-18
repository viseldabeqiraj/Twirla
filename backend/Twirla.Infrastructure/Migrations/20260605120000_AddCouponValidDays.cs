using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Twirla.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddCouponValidDays : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "coupon_valid_days",
                table: "shops",
                type: "INTEGER",
                nullable: false,
                defaultValue: 7);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "coupon_valid_days",
                table: "shops");
        }
    }
}
