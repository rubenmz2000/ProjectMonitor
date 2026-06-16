using Microsoft.AspNetCore.Mvc;
using ProjectMonitor.Core;
using ProjectMonitor.Core.DTOs;
using ProjectMonitor.Core.Entities;
using ProjectMonitor.Core.Enums;

namespace ProjectMonitor.API.Controllers;

[Route("/api/[controller]")]
[ApiController]
public class ProjectsController(IRepository<Project> projectRepository) : ControllerBase
{
    [HttpGet]
    public IActionResult GetAll()
    {
        return Ok(projectRepository.GetAll(p => !p.IsDeleted).ToList());
    }

    [Route("{id:guid}")]
    [HttpGet]
    public IActionResult GetById(Guid id)
    {
        var project = projectRepository.GetById(id);
        if (project == null) return NotFound();
        return Ok(project);
    }

    [Route("latest")]
    [HttpGet]
    public IActionResult GetLatestProjects()
    {
        return Ok(projectRepository.GetAll(p => !p.IsDeleted)
            .OrderByDescending(p => p.UpdatedAt)
            .Take(3)
            .Select(p => new ProjectResponseDto
            {
                Id = p.Id,
                Name = p.Name,
                Description = p.Description,
                Status = p.Status,
                UpdatedAt = p.UpdatedAt
            })
            .ToList());
    }

    [HttpPost]
    public IActionResult AddProject([FromBody] CreateProjectDto projectDto)
    {
        var now = DateTime.UtcNow;
        var project = new Project()
        {
            Id = Guid.NewGuid(),
            Name = projectDto.Name,
            Description = projectDto.Description,
            CreationDate = now,
            UpdatedAt = now,
            Status = ProjectStatus.NotStarted,
            IsDeleted = false,
            Tasks = []
        };
        projectRepository.Add(project);
        return Ok(projectRepository.SaveChanges());
    }

    [HttpPut("{id:guid}")]
    public IActionResult Update(Guid id, [FromBody] CreateProjectDto projectDto)
    {
        var project = projectRepository.GetById(id);
        if (project == null) return NotFound();
        project.Name = projectDto.Name;
        project.Description = projectDto.Description;
        project.UpdatedAt = DateTime.UtcNow;
        return Ok(projectRepository.SaveChanges());
    }

    [HttpDelete("{id:guid}")]
    public IActionResult Delete(Guid id)
    {
        var project = projectRepository.GetById(id);
        if (project == null) return NotFound();

        project.IsDeleted = true;
        return Ok(projectRepository.SaveChanges());
    }
}