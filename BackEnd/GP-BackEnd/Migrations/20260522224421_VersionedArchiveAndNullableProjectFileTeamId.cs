using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace GP_BackEnd.Migrations
{
    /// <inheritdoc />
    public partial class VersionedArchiveAndNullableProjectFileTeamId : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "IsSubmitted",
                table: "Teams",
                newName: "IsSubmittedV1");

            migrationBuilder.RenameColumn(
                name: "IsArchived",
                table: "Teams",
                newName: "IsSubmittedV0");

            migrationBuilder.RenameColumn(
                name: "ArchivedAt",
                table: "Teams",
                newName: "ArchivedAtV1");

            migrationBuilder.AddColumn<DateTime>(
                name: "ArchivedAtV0",
                table: "Teams",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "IsArchivedV0",
                table: "Teams",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "IsArchivedV1",
                table: "Teams",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<int>(
                name: "Version",
                table: "ProjectFiles",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.CreateTable(
                name: "ArchivedFiles",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    TeamId = table.Column<int>(type: "integer", nullable: false),
                    Version = table.Column<int>(type: "integer", nullable: false),
                    FileName = table.Column<string>(type: "text", nullable: false),
                    FilePath = table.Column<string>(type: "text", nullable: false),
                    Description = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ArchivedFiles", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ArchivedFiles_Teams_TeamId",
                        column: x => x.TeamId,
                        principalTable: "Teams",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_ArchivedFiles_TeamId",
                table: "ArchivedFiles",
                column: "TeamId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "ArchivedFiles");

            migrationBuilder.DropColumn(
                name: "ArchivedAtV0",
                table: "Teams");

            migrationBuilder.DropColumn(
                name: "IsArchivedV0",
                table: "Teams");

            migrationBuilder.DropColumn(
                name: "IsArchivedV1",
                table: "Teams");

            migrationBuilder.DropColumn(
                name: "Version",
                table: "ProjectFiles");

            migrationBuilder.RenameColumn(
                name: "IsSubmittedV1",
                table: "Teams",
                newName: "IsSubmitted");

            migrationBuilder.RenameColumn(
                name: "IsSubmittedV0",
                table: "Teams",
                newName: "IsArchived");

            migrationBuilder.RenameColumn(
                name: "ArchivedAtV1",
                table: "Teams",
                newName: "ArchivedAt");
        }
    }
}
