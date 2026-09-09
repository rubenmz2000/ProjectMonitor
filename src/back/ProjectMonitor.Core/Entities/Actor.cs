using ProjectMonitor.Core.Enums;

namespace ProjectMonitor.Core.Entities;

public class Actor
{
    public Guid Id { get; set; }
    public ActorKind Kind { get; set; }
    public required string DisplayName { get; set; }
    public required string Identifier { get; set; }
    public bool IsActive { get; set; }
}
