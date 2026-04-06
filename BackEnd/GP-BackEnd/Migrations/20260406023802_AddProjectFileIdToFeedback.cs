using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace GP_BackEnd.Migrations
{
    /// <inheritdoc />
    public partial class AddProjectFileIdToFeedback : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "ProjectFileId",
                table: "Feedbacks",
                type: "integer",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Feedbacks_ProjectFileId",
                table: "Feedbacks",
                column: "ProjectFileId");

            migrationBuilder.AddForeignKey(
                name: "FK_Feedbacks_ProjectFiles_ProjectFileId",
                table: "Feedbacks",
                column: "ProjectFileId",
                principalTable: "ProjectFiles",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Feedbacks_ProjectFiles_ProjectFileId",
                table: "Feedbacks");

            migrationBuilder.DropIndex(
                name: "IX_Feedbacks_ProjectFileId",
                table: "Feedbacks");

            migrationBuilder.DropColumn(
                name: "ProjectFileId",
                table: "Feedbacks");
        }
    }
}
