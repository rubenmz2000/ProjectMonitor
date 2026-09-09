using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ProjectMonitor.Core.Entities;

namespace ProjectMonitor.DataAccess.Configurations;

public class IssueConfiguration : IEntityTypeConfiguration<Issue>
{
    public void Configure(EntityTypeBuilder<Issue> builder)
    {
        builder.HasKey(i => i.Id);
        builder.Property(i => i.IssueNumber).IsRequired();
        builder.Property(i => i.Title).IsRequired().HasMaxLength(50);
        // No max length: the description is the persistent context of the issue and may be long
        builder.Property(i => i.Description).IsRequired();
        builder.Property(i => i.Status).HasConversion<string>();
        builder.Property(i => i.Priority).HasConversion<string>();
        builder.HasOne(i => i.Project).WithMany(p => p.Issues).HasForeignKey(i => i.ProjectId);
        builder.HasOne(i => i.CreatedBy).WithMany().HasForeignKey(i => i.CreatedById).OnDelete(DeleteBehavior.Restrict);
        builder.HasOne(i => i.Assignee).WithMany().HasForeignKey(i => i.AssigneeId).OnDelete(DeleteBehavior.Restrict);

        // Unique index: (ProjectId, IssueNumber) - ensures issue numbers are unique within a project
        builder.HasIndex(i => new { i.ProjectId, i.IssueNumber })
            .IsUnique()
            .HasDatabaseName("IX_Issue_ProjectId_IssueNumber");
    }
}
