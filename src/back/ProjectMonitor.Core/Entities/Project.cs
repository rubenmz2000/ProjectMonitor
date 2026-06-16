using ProjectMonitor.Core.Enums;

namespace ProjectMonitor.Core.Entities;

public class Project
{
    public Guid Id { get; set; }
    public required string Name { get; set; } 
    public required string Description  { get; set; }
    public ProjectStatus Status { get; set; }
    public DateTime CreationDate { get; set; }
    public DateTime UpdatedAt { get; set; }
    public bool IsDeleted { get; set; }

    public List<ProjectTask> Tasks { get; set; } = [];
}