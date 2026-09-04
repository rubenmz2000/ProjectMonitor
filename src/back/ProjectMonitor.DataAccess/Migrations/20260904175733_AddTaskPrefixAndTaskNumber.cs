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
            // Add TaskPrefix column to Projects table
            migrationBuilder.AddColumn<string>(
                name: "TaskPrefix",
                table: "Projects",
                type: "nvarchar(5)",
                maxLength: 5,
                nullable: false,
                defaultValue: "");

            // Add TaskNumber column to Tasks table
            migrationBuilder.AddColumn<int>(
                name: "TaskNumber",
                table: "Tasks",
                type: "int",
                nullable: false,
                defaultValue: 0);

            // Drop the existing non-unique index on ProjectId
            migrationBuilder.DropIndex(
                name: "IX_Tasks_ProjectId",
                table: "Tasks");

            // Create unique composite index (ProjectId, TaskNumber)
            migrationBuilder.CreateIndex(
                name: "IX_ProjectTask_ProjectId_TaskNumber",
                table: "Tasks",
                columns: new[] { "ProjectId", "TaskNumber" },
                unique: true);

            // Create unique filtered index on TaskPrefix
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
            // Drop unique filtered index on TaskPrefix
            migrationBuilder.DropIndex(
                name: "IX_Project_TaskPrefix",
                table: "Projects");

            // Drop unique composite index (ProjectId, TaskNumber)
            migrationBuilder.DropIndex(
                name: "IX_ProjectTask_ProjectId_TaskNumber",
                table: "Tasks");

            // Recreate the original non-unique index on ProjectId
            migrationBuilder.CreateIndex(
                name: "IX_Tasks_ProjectId",
                table: "Tasks",
                column: "ProjectId");

            // Drop TaskNumber column
            migrationBuilder.DropColumn(
                name: "TaskNumber",
                table: "Tasks");

            // Drop TaskPrefix column
            migrationBuilder.DropColumn(
                name: "TaskPrefix",
                table: "Projects");
        }
    }
}
