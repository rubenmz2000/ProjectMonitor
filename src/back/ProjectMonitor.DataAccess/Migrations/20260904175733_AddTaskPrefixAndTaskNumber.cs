using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ProjectMonitor.DataAccess.Migrations
{
    /// <inheritdoc />
    public partial class AddTaskPrefixAndTaskNumber : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_ProjectTask_ProjectId_TaskIdentifier",
                table: "Tasks");

            migrationBuilder.DropColumn(
                name: "TaskIdentifier",
                table: "Tasks");

            migrationBuilder.AddColumn<int>(
                name: "TaskNumber",
                table: "Tasks",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.CreateIndex(
                name: "IX_ProjectTask_ProjectId_TaskNumber",
                table: "Tasks",
                columns: new[] { "ProjectId", "TaskNumber" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Project_TaskPrefix",
                table: "Projects",
                column: "TaskPrefix",
                unique: true,
                filter: "[IsDeleted] = 0");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_ProjectTask_ProjectId_TaskNumber",
                table: "Tasks");

            migrationBuilder.DropIndex(
                name: "IX_Project_TaskPrefix",
                table: "Projects");

            migrationBuilder.DropColumn(
                name: "TaskNumber",
                table: "Tasks");

            migrationBuilder.AddColumn<string>(
                name: "TaskIdentifier",
                table: "Tasks",
                type: "nvarchar(50)",
                maxLength: 50,
                nullable: false,
                defaultValue: "");

            migrationBuilder.CreateIndex(
                name: "IX_ProjectTask_ProjectId_TaskIdentifier",
                table: "Tasks",
                columns: new[] { "ProjectId", "TaskIdentifier" },
                unique: true);
        }
    }
}
