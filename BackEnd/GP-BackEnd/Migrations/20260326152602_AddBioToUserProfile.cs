using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace GP_BackEnd.Migrations
{
    /// <inheritdoc />
    public partial class AddBioToUserProfile : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Bio",
                table: "UserProfiles",
                type: "text",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Bio",
                table: "UserProfiles");
        }
    }
}
