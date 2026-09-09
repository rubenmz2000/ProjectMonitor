using ProjectMonitor.Core.Enums;

namespace ProjectMonitor.Core.DTOs;

public class TaskResponseDto
{
    public Guid Id { get; set; }
    public int TaskNumber { get; set; }
    public string TaskIdentifier { get; set; }
    public string Title { get; set; }
    public string Description { get; set; }
    public ProjectTaskStatus Status { get; set; }
    public Priority Priority { get; set; }
    public DateTime? DueDate { get; set; }
    public DateTime CreationDate { get; set; }
    public DateTime UpdatedAt { get; set; }
    public ActorDto CreatedBy { get; set; } = null!;
    public ActorDto? Assignee { get; set; }
}
