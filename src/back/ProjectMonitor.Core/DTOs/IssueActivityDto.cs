using ProjectMonitor.Core.Enums;

namespace ProjectMonitor.Core.DTOs;

public class IssueActivityDto
{
    public Guid Id { get; set; }
    public IssueActivityType Type { get; set; }
    public DateTime OccurredAt { get; set; }
    public ActorDto Actor { get; set; } = null!;

    /// <summary>Previous value, only for change activities.</summary>
    public ActivityValueDto? From { get; set; }

    /// <summary>New value, only for change activities.</summary>
    public ActivityValueDto? To { get; set; }

    public string? Body { get; set; }
}
