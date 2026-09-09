using ProjectMonitor.Core.Enums;

namespace ProjectMonitor.Core.DTOs;

public class TaskDetailResponseDto
{
    public Guid Id { get; set; }
    public int TaskNumber { get; set; }
    public string TaskIdentifier { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public ProjectTaskStatus Status { get; set; }
    public Priority Priority { get; set; }
    public DateTime? DueDate { get; set; }
    public DateTime CreationDate { get; set; }
    public DateTime UpdatedAt { get; set; }
    
    // Project context
    public string ProjectName { get; set; } = string.Empty;
    public string TaskPrefix { get; set; } = string.Empty;

    // Actor context
    public ActorDto CreatedBy { get; set; } = null!;
    public ActorDto? Assignee { get; set; }
}
