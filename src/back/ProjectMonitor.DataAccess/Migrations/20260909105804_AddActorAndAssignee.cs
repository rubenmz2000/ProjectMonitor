using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ProjectMonitor.DataAccess.Migrations
{
    /// <inheritdoc />
    public partial class AddActorAndAssignee : Migration
    {
        // Fixed GUIDs for seed actors so FK backfill can reference them
        private static readonly Guid RubenId = Guid.Parse("A0000001-0001-0001-0001-000000000001");
        private static readonly Guid IrisId = Guid.Parse("A0000002-0002-0002-0002-000000000002");

        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // 1. Create Actors table first
            migrationBuilder.CreateTable(
                name: "Actors",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Kind = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    DisplayName = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Identifier = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    IsActive = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Actors", x => x.Id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Actor_Identifier",
                table: "Actors",
                column: "Identifier",
                unique: true);

            // 2. Seed actors
            migrationBuilder.InsertData(
                table: "Actors",
                columns: ["Id", "Kind", "DisplayName", "Identifier", "IsActive"],
                values: new object[,]
                {
                    { RubenId, "Human", "Rubén", "ruben", true },
                    { IrisId, "Agent", "Iris", "iris", true }
                });

            // 3. Add AssigneeId (nullable - no backfill needed)
            migrationBuilder.AddColumn<Guid>(
                name: "AssigneeId",
                table: "Tasks",
                type: "uniqueidentifier",
                nullable: true);

            // 4. Add CreatedById as nullable first, backfill, then make NOT NULL
            migrationBuilder.AddColumn<Guid>(
                name: "CreatedById",
                table: "Tasks",
                type: "uniqueidentifier",
                nullable: true);

            // 5. Backfill existing rows with Rubén as creator
            migrationBuilder.Sql($@"
                UPDATE Tasks SET CreatedById = '{RubenId}' WHERE CreatedById IS NULL
            ");

            // 6. Alter column to NOT NULL
            migrationBuilder.AlterColumn<Guid>(
                name: "CreatedById",
                table: "Tasks",
                type: "uniqueidentifier",
                nullable: false);

            // 7. Create FK indexes
            migrationBuilder.CreateIndex(
                name: "IX_Tasks_AssigneeId",
                table: "Tasks",
                column: "AssigneeId");

            migrationBuilder.CreateIndex(
                name: "IX_Tasks_CreatedById",
                table: "Tasks",
                column: "CreatedById");

            // 8. Add foreign keys
            migrationBuilder.AddForeignKey(
                name: "FK_Tasks_Actors_AssigneeId",
                table: "Tasks",
                column: "AssigneeId",
                principalTable: "Actors",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Tasks_Actors_CreatedById",
                table: "Tasks",
                column: "CreatedById",
                principalTable: "Actors",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Tasks_Actors_AssigneeId",
                table: "Tasks");

            migrationBuilder.DropForeignKey(
                name: "FK_Tasks_Actors_CreatedById",
                table: "Tasks");

            migrationBuilder.DropIndex(
                name: "IX_Tasks_AssigneeId",
                table: "Tasks");

            migrationBuilder.DropIndex(
                name: "IX_Tasks_CreatedById",
                table: "Tasks");

            migrationBuilder.DropColumn(
                name: "AssigneeId",
                table: "Tasks");

            migrationBuilder.DropColumn(
                name: "CreatedById",
                table: "Tasks");

            migrationBuilder.DropTable(
                name: "Actors");
        }
    }
}
