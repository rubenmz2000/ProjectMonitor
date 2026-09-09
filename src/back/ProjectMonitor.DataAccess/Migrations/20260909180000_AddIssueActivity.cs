using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ProjectMonitor.DataAccess.Migrations
{
    /// <summary>
    /// PM-0007: adds the append-only IssueActivities table and backfills one "Created" activity
    /// per existing issue (actor = CreatedById, time = CreationDate) so no history starts empty.
    ///
    /// Written by hand (no EF tooling available in the authoring session). Names created here:
    ///   Table   IssueActivities
    ///   PK      PK_IssueActivities
    ///   FK      FK_IssueActivities_Issues_IssueId   (ON DELETE CASCADE)
    ///   FK      FK_IssueActivities_Actors_ActorId   (ON DELETE NO ACTION / Restrict)
    ///   Index   IX_IssueActivities_ActorId
    ///   Index   IX_IssueActivity_IssueId_OccurredAt
    /// Existing names it depends on: tables Issues (columns Id, CreatedById, CreationDate) and Actors (Id).
    /// </summary>
    public partial class AddIssueActivity : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "IssueActivities",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    IssueId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    ActorId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    OccurredAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    Type = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    OldValue = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    NewValue = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    Body = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_IssueActivities", x => x.Id);
                    table.ForeignKey(
                        name: "FK_IssueActivities_Actors_ActorId",
                        column: x => x.ActorId,
                        principalTable: "Actors",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_IssueActivities_Issues_IssueId",
                        column: x => x.IssueId,
                        principalTable: "Issues",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_IssueActivities_ActorId",
                table: "IssueActivities",
                column: "ActorId");

            migrationBuilder.CreateIndex(
                name: "IX_IssueActivity_IssueId_OccurredAt",
                table: "IssueActivities",
                columns: new[] { "IssueId", "OccurredAt" });

            // Backfill: every existing issue gets its "Created" activity
            migrationBuilder.Sql(@"
                INSERT INTO IssueActivities (Id, IssueId, ActorId, OccurredAt, Type, OldValue, NewValue, Body)
                SELECT NEWID(), Id, CreatedById, CreationDate, 'Created', NULL, NULL, NULL
                FROM Issues
            ");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "IssueActivities");
        }
    }
}
