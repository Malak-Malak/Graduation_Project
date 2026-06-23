using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace GP_BackEnd.Migrations
{
    /// <inheritdoc />
    public partial class AddNotifiedOverdueToTaskItem : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "NotifiedOverdue",
                table: "TaskItems",
                type: "boolean",
                nullable: false,
                defaultValue: false);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "NotifiedOverdue",
                table: "TaskItems");
        }
    }
}
