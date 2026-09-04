using ProjectMonitor.Core.Enums;

namespace ProjectMonitor.Core.DTOs;

public class CreateTaskDto
{
    public required string Title { get; set; }
    public required string Description { get; set; }
    public Priority Priority { get; set; } = Priority.Medium;
    public DateTime? DueDate { get; set; }
}
