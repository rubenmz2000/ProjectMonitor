using ProjectMonitor.Core.Enums;

namespace ProjectMonitor.Core.DTOs;

public class ProjectResponseDto
{
    public Guid Id { get; set; }
    public string Name { get; set; }
    public string Description { get; set; }
    public string TaskPrefix { get; set; }
    public ProjectStatus Status { get; set; }
    public DateTime UpdatedAt { get; set; }
}
