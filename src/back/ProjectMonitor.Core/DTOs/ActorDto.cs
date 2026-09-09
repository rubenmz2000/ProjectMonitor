namespace ProjectMonitor.Core.DTOs;

public class ActorDto
{
    public Guid Id { get; set; }
    public string DisplayName { get; set; } = string.Empty;
    public string Identifier { get; set; } = string.Empty;
    public string Kind { get; set; } = string.Empty;
}
