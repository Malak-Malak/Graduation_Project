using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace GP_BackEnd.Migrations
{
    /// <inheritdoc />
    public partial class addedFieldAttribute : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "field",
                table: "UserProfiles",
                type: "text",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "field",
                table: "UserProfiles");
        }
    }
}
