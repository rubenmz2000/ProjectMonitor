using ProjectMonitor.Core.Enums;

namespace ProjectMonitor.Core.DTOs;

public class ProjectStatusCountDto
{
    public ProjectStatus Status { get; set; }
    public int Count { get; set; }
}