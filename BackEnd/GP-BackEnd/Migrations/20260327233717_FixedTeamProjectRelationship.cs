using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace GP_BackEnd.Migrations
{
    /// <inheritdoc />
    public partial class FixedTeamProjectRelationship : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Teams_Projects_ProjectId1",
                table: "Teams");

            migrationBuilder.DropIndex(
                name: "IX_Teams_ProjectId1",
                table: "Teams");

            migrationBuilder.DropColumn(
                name: "ProjectId1",
                table: "Teams");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "ProjectId1",
                table: "Teams",
                type: "integer",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Teams_ProjectId1",
                table: "Teams",
                column: "ProjectId1");

            migrationBuilder.AddForeignKey(
                name: "FK_Teams_Projects_ProjectId1",
                table: "Teams",
                column: "ProjectId1",
                principalTable: "Projects",
                principalColumn: "Id");
        }
    }
}
