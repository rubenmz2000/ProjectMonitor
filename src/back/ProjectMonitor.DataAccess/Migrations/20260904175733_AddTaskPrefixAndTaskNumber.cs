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
            // Step 1: Add TaskPrefix column to Projects
            migrationBuilder.AddColumn<string>(
                name: "TaskPrefix",
                table: "Projects",
                type: "nvarchar(5)",
                maxLength: 5,
                nullable: false,
                defaultValue: "");

            // Step 2: Generate unique TaskPrefix for existing projects
            // Use first 5 alphanumeric characters from the Project Id (Guid)
            migrationBuilder.Sql(@"
                UPDATE Projects 
                SET TaskPrefix = UPPER(
                    REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(
                        SUBSTRING(CAST(Id AS NVARCHAR(36)), 1, 5),
                        '-', ''), ' ', ''), '_', ''), '.', ''), ',', '')
                )
                WHERE TaskPrefix = ''
            ");

            // Step 3: Add TaskNumber column to Tasks
            migrationBuilder.AddColumn<int>(
                name: "TaskNumber",
                table: "Tasks",
                type: "int",
                nullable: false,
                defaultValue: 0);

            // Step 4: Assign sequential TaskNumber to existing tasks per project
            // Order by CreationDate, then by Id for deterministic ordering
            migrationBuilder.Sql(@"
                WITH NumberedTasks AS (
                    SELECT 
                        Id,
                        ProjectId,
                        ROW_NUMBER() OVER (
                            PARTITION BY ProjectId 
                            ORDER BY CreationDate, Id
                        ) AS RowNum
                    FROM Tasks
                    WHERE TaskNumber = 0
                )
                UPDATE Tasks
                SET TaskNumber = NumberedTasks.RowNum
                FROM Tasks
                INNER JOIN NumberedTasks ON Tasks.Id = NumberedTasks.Id
            ");

            // Step 5: Drop the existing non-unique index on Tasks.ProjectId
            migrationBuilder.DropIndex(
                name: "IX_Tasks_ProjectId",
                table: "Tasks");

            // Step 6: Create unique composite index (ProjectId, TaskNumber)
            migrationBuilder.CreateIndex(
                name: "IX_ProjectTask_ProjectId_TaskNumber",
                table: "Tasks",
                columns: new[] { "ProjectId", "TaskNumber" },
                unique: true);

            // Step 7: Create unique filtered index on TaskPrefix (only for non-deleted projects)
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
            // Reverse Step 7: Drop unique index on TaskPrefix
            migrationBuilder.DropIndex(
                name: "IX_Project_TaskPrefix",
                table: "Projects");

            // Reverse Step 6: Drop unique composite index
            migrationBuilder.DropIndex(
                name: "IX_ProjectTask_ProjectId_TaskNumber",
                table: "Tasks");

            // Reverse Step 5: Recreate the original non-unique index
            migrationBuilder.CreateIndex(
                name: "IX_Tasks_ProjectId",
                table: "Tasks",
                column: "ProjectId");

            // Reverse Steps 4, 3, 2, 1: Remove columns
            migrationBuilder.DropColumn(
                name: "TaskNumber",
                table: "Tasks");

            migrationBuilder.DropColumn(
                name: "TaskPrefix",
                table: "Projects");
        }
    }
}
