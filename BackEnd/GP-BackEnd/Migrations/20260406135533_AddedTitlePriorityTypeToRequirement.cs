using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace GP_BackEnd.Migrations
{
    /// <inheritdoc />
    public partial class AddedTitlePriorityTypeToRequirement : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Priority",
                table: "Requirements",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "Title",
                table: "Requirements",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "Type",
                table: "Requirements",
                type: "text",
                nullable: false,
                defaultValue: "");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Priority",
                table: "Requirements");

            migrationBuilder.DropColumn(
                name: "Title",
                table: "Requirements");

            migrationBuilder.DropColumn(
                name: "Type",
                table: "Requirements");
        }
    }
}
