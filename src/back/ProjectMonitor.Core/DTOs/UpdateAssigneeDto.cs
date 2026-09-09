namespace ProjectMonitor.Core.DTOs;

public class UpdateAssigneeDto
{
    public Guid? AssigneeId { get; set; }

    /// <summary>Optional note explaining the reassignment; stored with the activity.</summary>
    public string? Note { get; set; }
}
