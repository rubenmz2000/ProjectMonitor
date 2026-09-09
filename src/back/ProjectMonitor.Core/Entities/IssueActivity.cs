using ProjectMonitor.Core.Enums;

namespace ProjectMonitor.Core.Entities;

/// <summary>
/// Something that happened to an issue: who did it, when, and what. Append-only.
/// The issue itself keeps the current state; activities explain how it got there.
/// </summary>
public class IssueActivity
{
    public Guid Id { get; set; }
    public Guid IssueId { get; set; }
    public Guid ActorId { get; set; }
    public DateTime OccurredAt { get; set; }
    public IssueActivityType Type { get; set; }

    /// <summary>Previous value for change activities (e.g. the previous assignee's Actor Id). Null when not applicable.</summary>
    public string? OldValue { get; set; }

    /// <summary>New value for change activities. Null when not applicable.</summary>
    public string? NewValue { get; set; }

    /// <summary>Free text: the comment itself, or an optional note attached to a change.</summary>
    public string? Body { get; set; }

    public Issue Issue { get; set; } = null!;
    public Actor Actor { get; set; } = null!;
}
