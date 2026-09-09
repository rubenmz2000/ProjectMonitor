using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ProjectMonitor.DataAccess.Migrations
{
    /// <summary>
    /// PM-0006: renames the ProjectTask concept to Issue in the database and removes the
    /// 300-character limit on the issue description. Rename-only: no data is dropped or recreated.
    ///
    /// This migration was written by hand (no EF tooling available in the authoring session).
    /// Object names it assumes exist in the database, taken from the previous migrations:
    ///   Table        Tasks                              (InitialMigration)
    ///   PK           PK_Tasks                           (InitialMigration)
    ///   FK           FK_Tasks_Projects_ProjectId        (InitialMigration)
    ///   FK           FK_Tasks_Actors_AssigneeId         (AddActorAndAssignee)
    ///   FK           FK_Tasks_Actors_CreatedById        (AddActorAndAssignee)
    ///   Index        IX_Tasks_AssigneeId                (AddActorAndAssignee)
    ///   Index        IX_Tasks_CreatedById               (AddActorAndAssignee)
    ///   Index        IX_ProjectTask_ProjectId_TaskNumber (AddTaskPrefixAndTaskNumber, unique)
    ///   Index        IX_Project_TaskPrefix              (AddTaskPrefixAndTaskNumber, unique, filtered [IsDeleted] = 0)
    ///   Column       Tasks.TaskNumber                   (AddTaskPrefixAndTaskNumber)
    ///   Column       Projects.TaskPrefix                (AddTaskPrefixAndTaskNumber)
    ///   Column       Tasks.Description nvarchar(300)    (InitialMigration)
    /// To validate before applying:
    ///   SELECT name FROM sys.objects WHERE name IN ('PK_Tasks','FK_Tasks_Projects_ProjectId','FK_Tasks_Actors_AssigneeId','FK_Tasks_Actors_CreatedById');
    ///   SELECT name FROM sys.indexes WHERE object_id IN (OBJECT_ID('Tasks'), OBJECT_ID('Projects'));
    /// </summary>
    public partial class RenameProjectTaskToIssue : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // 1. Table
            migrationBuilder.RenameTable(
                name: "Tasks",
                newName: "Issues");

            // 2. Columns
            migrationBuilder.RenameColumn(
                name: "TaskNumber",
                table: "Issues",
                newName: "IssueNumber");

            migrationBuilder.RenameColumn(
                name: "TaskPrefix",
                table: "Projects",
                newName: "IssuePrefix");

            // 3. Indexes (sp_rename keeps uniqueness and filters)
            migrationBuilder.RenameIndex(
                name: "IX_ProjectTask_ProjectId_TaskNumber",
                table: "Issues",
                newName: "IX_Issue_ProjectId_IssueNumber");

            migrationBuilder.RenameIndex(
                name: "IX_Tasks_AssigneeId",
                table: "Issues",
                newName: "IX_Issues_AssigneeId");

            migrationBuilder.RenameIndex(
                name: "IX_Tasks_CreatedById",
                table: "Issues",
                newName: "IX_Issues_CreatedById");

            migrationBuilder.RenameIndex(
                name: "IX_Project_TaskPrefix",
                table: "Projects",
                newName: "IX_Project_IssuePrefix");

            // 4. Constraints (EF Core has no rename operation for PK/FK names)
            migrationBuilder.Sql("EXEC sp_rename N'PK_Tasks', N'PK_Issues', N'OBJECT';");
            migrationBuilder.Sql("EXEC sp_rename N'FK_Tasks_Projects_ProjectId', N'FK_Issues_Projects_ProjectId', N'OBJECT';");
            migrationBuilder.Sql("EXEC sp_rename N'FK_Tasks_Actors_AssigneeId', N'FK_Issues_Actors_AssigneeId', N'OBJECT';");
            migrationBuilder.Sql("EXEC sp_rename N'FK_Tasks_Actors_CreatedById', N'FK_Issues_Actors_CreatedById', N'OBJECT';");

            // 5. Description: drop the 300-character limit
            migrationBuilder.AlterColumn<string>(
                name: "Description",
                table: "Issues",
                type: "nvarchar(max)",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(300)",
                oldMaxLength: 300);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            // Reverse 5 (descriptions longer than 300 characters would be truncated by SQL Server: fails)
            migrationBuilder.AlterColumn<string>(
                name: "Description",
                table: "Issues",
                type: "nvarchar(300)",
                maxLength: 300,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)");

            // Reverse 4
            migrationBuilder.Sql("EXEC sp_rename N'FK_Issues_Actors_CreatedById', N'FK_Tasks_Actors_CreatedById', N'OBJECT';");
            migrationBuilder.Sql("EXEC sp_rename N'FK_Issues_Actors_AssigneeId', N'FK_Tasks_Actors_AssigneeId', N'OBJECT';");
            migrationBuilder.Sql("EXEC sp_rename N'FK_Issues_Projects_ProjectId', N'FK_Tasks_Projects_ProjectId', N'OBJECT';");
            migrationBuilder.Sql("EXEC sp_rename N'PK_Issues', N'PK_Tasks', N'OBJECT';");

            // Reverse 3
            migrationBuilder.RenameIndex(
                name: "IX_Project_IssuePrefix",
                table: "Projects",
                newName: "IX_Project_TaskPrefix");

            migrationBuilder.RenameIndex(
                name: "IX_Issues_CreatedById",
                table: "Issues",
                newName: "IX_Tasks_CreatedById");

            migrationBuilder.RenameIndex(
                name: "IX_Issues_AssigneeId",
                table: "Issues",
                newName: "IX_Tasks_AssigneeId");

            migrationBuilder.RenameIndex(
                name: "IX_Issue_ProjectId_IssueNumber",
                table: "Issues",
                newName: "IX_ProjectTask_ProjectId_TaskNumber");

            // Reverse 2
            migrationBuilder.RenameColumn(
                name: "IssuePrefix",
                table: "Projects",
                newName: "TaskPrefix");

            migrationBuilder.RenameColumn(
                name: "IssueNumber",
                table: "Issues",
                newName: "TaskNumber");

            // Reverse 1
            migrationBuilder.RenameTable(
                name: "Issues",
                newName: "Tasks");
        }
    }
}
