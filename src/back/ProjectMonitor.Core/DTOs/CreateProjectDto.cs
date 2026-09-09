namespace ProjectMonitor.Core.DTOs;

public class CreateProjectDto
{
    public required string Name { get; set; }
    public required string Description { get; set; }
    public required string IssuePrefix { get; set; }
}
