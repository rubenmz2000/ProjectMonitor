using ProjectMonitor.Core.Enums;
namespace ProjectMonitor.Core.Entities;

public class Issue
{
    public Guid Id { get; set; }
    public int IssueNumber { get; set; }
    public required string Title { get; set; }
    public required string Description { get; set; }
    public IssueStatus Status { get; set; }
    public DateTime CreationDate { get; set; }
    public DateTime UpdatedAt { get; set; }
    public Priority Priority { get; set; }
    public DateTime DueDate { get; set; }
    public Guid ProjectId { get; set; }
    public Guid CreatedById { get; set; }
    public Guid? AssigneeId { get; set; }
    public bool IsDeleted { get; set; }

    public Project Project { get; set; } = null!;
    public Actor CreatedBy { get; set; } = null!;
    public Actor? Assignee { get; set; }
}
