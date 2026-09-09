namespace ProjectMonitor.Core.DTOs;

/// <summary>
/// A value involved in a change activity: the raw stored value (e.g. an Actor Id) and a
/// human-readable label resolved by the API, so clients don't need to interpret the value.
/// </summary>
public class ActivityValueDto
{
    public string? Value { get; set; }
    public string Label { get; set; } = string.Empty;
}
