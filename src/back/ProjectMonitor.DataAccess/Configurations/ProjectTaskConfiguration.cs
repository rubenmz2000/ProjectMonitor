using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ProjectMonitor.Core.Entities;

namespace ProjectMonitor.DataAccess.Configurations;

public class ProjectTaskConfiguration : IEntityTypeConfiguration<ProjectTask>
{
    public void Configure(EntityTypeBuilder<ProjectTask> builder)
    {
        builder.HasKey(t => t.Id);
        builder.Property(t => t.TaskNumber).IsRequired();
        builder.Property(t => t.Title).IsRequired().HasMaxLength(50);
        builder.Property(t => t.Description).IsRequired().HasMaxLength(300);
        builder.Property(t => t.Status).HasConversion<string>();
        builder.Property(t => t.Priority).HasConversion<string>();
        builder.HasOne(t => t.Project).WithMany(p => p.Tasks).HasForeignKey(t => t.ProjectId);
        
        // Unique index: (ProjectId, TaskNumber) - ensures task numbers are unique within a project
        builder.HasIndex(t => new { t.ProjectId, t.TaskNumber })
            .IsUnique()
            .HasDatabaseName("IX_ProjectTask_ProjectId_TaskNumber");
    }
}
