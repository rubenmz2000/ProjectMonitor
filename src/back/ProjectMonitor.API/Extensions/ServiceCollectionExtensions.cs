using ProjectMonitor.API.Services;

namespace ProjectMonitor.API.Extensions;

public static class ServiceCollectionExtensions
{
    public static IServiceCollection AddCurrentActor(this IServiceCollection services)
    {
        services.AddHttpContextAccessor();
        services.AddScoped<ICurrentActorResolver, CurrentActorResolver>();
        return services;
    }
}
