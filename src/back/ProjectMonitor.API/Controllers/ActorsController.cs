using Microsoft.AspNetCore.Mvc;
using ProjectMonitor.Core;
using ProjectMonitor.Core.DTOs;
using ProjectMonitor.Core.Entities;

namespace ProjectMonitor.API.Controllers;

[Route("api/actors")]
[ApiController]
public class ActorsController(IRepository<Actor> actorRepository) : ControllerBase
{
    [HttpGet]
    public IActionResult GetActiveActors()
    {
        var actors = actorRepository.GetAll(a => a.IsActive)
            .Select(a => new ActorDto
            {
                Id = a.Id,
                DisplayName = a.DisplayName,
                Identifier = a.Identifier,
                Kind = a.Kind.ToString()
            })
            .OrderBy(a => a.DisplayName)
            .ToList();

        return Ok(actors);
    }
}
