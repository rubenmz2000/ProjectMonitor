using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ProjectMonitor.Core.Entities;

namespace ProjectMonitor.DataAccess.Configurations;

public class ProjectConfiguration : IEntityTypeConfiguration<Project>
{
    public void Configure(EntityTypeBuilder<Project> builder)
    {
        builder.HasKey(p => p.Id);
        builder.Property(p => p.Name).IsRequired().HasMaxLength(50);
        builder.Property(p => p.Description).IsRequired().HasMaxLength(300);
        builder.Property(p => p.IssuePrefix).IsRequired().HasMaxLength(5);
        builder.Property(p => p.Status).HasConversion<string>();
        builder.HasMany(p => p.Issues).WithOne(i => i.Project).HasForeignKey(i => i.ProjectId);

        // Unique index on IssuePrefix - ensures issue identifiers are globally unique
        builder.HasIndex(p => p.IssuePrefix)
            .IsUnique()
            .HasDatabaseName("IX_Project_IssuePrefix")
            .HasFilter("[IsDeleted] = 0"); // Only enforce uniqueness on non-deleted projects
    }
}
