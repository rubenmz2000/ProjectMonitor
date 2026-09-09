using ProjectMonitor.Core;
using ProjectMonitor.Core.Entities;

namespace ProjectMonitor.API.Services;

public class CurrentActorResolver(IHttpContextAccessor httpContextAccessor, IRepository<Actor> actorRepository) : ICurrentActorResolver
{
    public const string HeaderName = "X-Actor-Identifier";

    private Actor? _resolved;
    private bool _attempted;

    public Actor? Resolve()
    {
        if (_attempted) return _resolved;
        _attempted = true;

        var identifier = httpContextAccessor.HttpContext?.Request.Headers[HeaderName].FirstOrDefault();
        if (string.IsNullOrWhiteSpace(identifier))
            return null;

        _resolved = actorRepository.GetAll(a => a.Identifier == identifier && a.IsActive).FirstOrDefault();
        return _resolved;
    }
}
