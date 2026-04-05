using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace GP_BackEnd.Migrations
{
    /// <inheritdoc />
    public partial class UpdatedAttachmentToTeam : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_TaskAttachments_TaskItems_TaskItemId",
                table: "ProjectFiles");

            migrationBuilder.RenameColumn(
                name: "TaskItemId",
                table: "ProjectFiles",
                newName: "TeamId");

            migrationBuilder.RenameIndex(
                name: "IX_TaskAttachments_TaskItemId",
                table: "ProjectFiles",
                newName: "IX_TaskAttachments_TeamId");

            migrationBuilder.CreateTable(
                name: "Requirements",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Description = table.Column<string>(type: "text", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    ProjectId = table.Column<int>(type: "integer", nullable: false),
                    CreatedByUserId = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Requirements", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Requirements_Projects_ProjectId",
                        column: x => x.ProjectId,
                        principalTable: "Projects",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Requirements_Users_CreatedByUserId",
                        column: x => x.CreatedByUserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Requirements_CreatedByUserId",
                table: "Requirements",
                column: "CreatedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_Requirements_ProjectId",
                table: "Requirements",
                column: "ProjectId");

            migrationBuilder.AddForeignKey(
                name: "FK_TaskAttachments_Teams_TeamId",
                table: "ProjectFiles",
                column: "TeamId",
                principalTable: "Teams",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_TaskAttachments_Teams_TeamId",
                table: "ProjectFiles");

            migrationBuilder.DropTable(
                name: "Requirements");

            migrationBuilder.RenameColumn(
                name: "TeamId",
                table: "ProjectFiles",
                newName: "TaskItemId");

            migrationBuilder.RenameIndex(
                name: "IX_TaskAttachments_TeamId",
                table: "ProjectFiles",
                newName: "IX_TaskAttachments_TaskItemId");

            migrationBuilder.AddForeignKey(
                name: "FK_TaskAttachments_TaskItems_TaskItemId",
                table: "ProjectFiles",
                column: "TaskItemId",
                principalTable: "TaskItems",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
