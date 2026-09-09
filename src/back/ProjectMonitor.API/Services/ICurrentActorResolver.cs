using ProjectMonitor.Core.Entities;

namespace ProjectMonitor.API.Services;

/// <summary>
/// Resolves the actor performing the current request. Today the identity comes from the
/// X-Actor-Identifier header, a transitory mechanism until real authentication exists.
/// </summary>
public interface ICurrentActorResolver
{
    /// <summary>Returns the active actor for the current request, or null if the header is missing or unknown.</summary>
    Actor? Resolve();
}
