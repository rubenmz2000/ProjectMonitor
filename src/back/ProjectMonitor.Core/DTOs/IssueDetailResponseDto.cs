using ProjectMonitor.Core.Enums;

namespace ProjectMonitor.Core.DTOs;

public class IssueDetailResponseDto
{
    public Guid Id { get; set; }
    public int IssueNumber { get; set; }
    public string IssueIdentifier { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public IssueStatus Status { get; set; }
    public Priority Priority { get; set; }
    public DateTime? DueDate { get; set; }
    public DateTime CreationDate { get; set; }
    public DateTime UpdatedAt { get; set; }

    // Project context
    public string ProjectName { get; set; } = string.Empty;
    public string IssuePrefix { get; set; } = string.Empty;

    // Actor context
    public ActorDto CreatedBy { get; set; } = null!;
    public ActorDto? Assignee { get; set; }
}
