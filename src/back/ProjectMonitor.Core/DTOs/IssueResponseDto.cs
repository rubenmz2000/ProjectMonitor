using ProjectMonitor.Core.Enums;

namespace ProjectMonitor.Core.DTOs;

public class IssueResponseDto
{
    public Guid Id { get; set; }
    public int IssueNumber { get; set; }
    public string IssueIdentifier { get; set; }
    public string Title { get; set; }
    public string Description { get; set; }
    public IssueStatus Status { get; set; }
    public Priority Priority { get; set; }
    public DateTime? DueDate { get; set; }
    public DateTime CreationDate { get; set; }
    public DateTime UpdatedAt { get; set; }
    public ActorDto CreatedBy { get; set; } = null!;
    public ActorDto? Assignee { get; set; }
}
