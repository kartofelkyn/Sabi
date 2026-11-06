using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Sabi.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddAccountTypeToAccount : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "Type",
                table: "Accounts",
                type: "int",
                nullable: false,
                defaultValue: 0);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Type",
                table: "Accounts");
        }
    }
}
