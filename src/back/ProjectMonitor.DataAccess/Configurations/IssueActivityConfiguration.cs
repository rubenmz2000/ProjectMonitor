using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ProjectMonitor.Core.Entities;

namespace ProjectMonitor.DataAccess.Configurations;

public class IssueActivityConfiguration : IEntityTypeConfiguration<IssueActivity>
{
    public void Configure(EntityTypeBuilder<IssueActivity> builder)
    {
        builder.HasKey(a => a.Id);
        builder.Property(a => a.OccurredAt).IsRequired();
        builder.Property(a => a.Type).HasConversion<string>();
        builder.Property(a => a.OldValue).HasMaxLength(100);
        builder.Property(a => a.NewValue).HasMaxLength(100);
        // Body has no max length: comments and notes may carry real context

        builder.HasOne(a => a.Issue).WithMany().HasForeignKey(a => a.IssueId).OnDelete(DeleteBehavior.Cascade);
        builder.HasOne(a => a.Actor).WithMany().HasForeignKey(a => a.ActorId).OnDelete(DeleteBehavior.Restrict);

        // The history of an issue is always read in chronological order
        builder.HasIndex(a => new { a.IssueId, a.OccurredAt })
            .HasDatabaseName("IX_IssueActivity_IssueId_OccurredAt");
    }
}
