using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace GP_BackEnd.Migrations
{
    /// <inheritdoc />
    public partial class AddedHeadOfDepartmentFeatures : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "IsHeadOfDepartment",
                table: "Users",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.CreateTable(
                name: "DiscussionSlots",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    DateTime = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    Location = table.Column<string>(type: "text", nullable: false),
                    Notes = table.Column<string>(type: "text", nullable: true),
                    HeadOfDepartmentId = table.Column<int>(type: "integer", nullable: false),
                    Department = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_DiscussionSlots", x => x.Id);
                    table.ForeignKey(
                        name: "FK_DiscussionSlots_Users_HeadOfDepartmentId",
                        column: x => x.HeadOfDepartmentId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "TeamDiscussionSlots",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    TeamId = table.Column<int>(type: "integer", nullable: false),
                    DiscussionSlotId = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TeamDiscussionSlots", x => x.Id);
                    table.ForeignKey(
                        name: "FK_TeamDiscussionSlots_DiscussionSlots_DiscussionSlotId",
                        column: x => x.DiscussionSlotId,
                        principalTable: "DiscussionSlots",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_TeamDiscussionSlots_Teams_TeamId",
                        column: x => x.TeamId,
                        principalTable: "Teams",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_DiscussionSlots_HeadOfDepartmentId",
                table: "DiscussionSlots",
                column: "HeadOfDepartmentId");

            migrationBuilder.CreateIndex(
                name: "IX_TeamDiscussionSlots_DiscussionSlotId",
                table: "TeamDiscussionSlots",
                column: "DiscussionSlotId");

            migrationBuilder.CreateIndex(
                name: "IX_TeamDiscussionSlots_TeamId",
                table: "TeamDiscussionSlots",
                column: "TeamId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "TeamDiscussionSlots");

            migrationBuilder.DropTable(
                name: "DiscussionSlots");

            migrationBuilder.DropColumn(
                name: "IsHeadOfDepartment",
                table: "Users");
        }
    }
}
