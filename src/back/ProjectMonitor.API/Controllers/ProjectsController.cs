using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
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

    [HttpGet("{id:guid}")]
    public IActionResult GetById(Guid id)
    {
        var project = projectRepository.GetById(id);
        if (project == null) return NotFound();
        return Ok(project);
    }

    [HttpGet("latest")]
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

    [HttpGet("status-count")]
    public IActionResult GetProjectsStatusCount()
    {
        var statusValues = Enum.GetValues<ProjectStatus>();
        List<ProjectStatusCountDto> count = [];
        count.AddRange(statusValues.Select(status => new ProjectStatusCountDto
        {
            Status = status, Count = projectRepository.GetAll(p => !p.IsDeleted)
                .Count(p => p.Status == status)
        }));
        return Ok(count);
    }

    [HttpPost]
    public IActionResult AddProject([FromBody] CreateProjectDto projectDto)
    {
        var alreadyCreated = projectRepository.GetAll(p => p.Name == projectDto.Name && !p.IsDeleted).FirstOrDefault() != null;
        if (alreadyCreated)
            return BadRequest("This project is already created");
        
        var now = DateTime.UtcNow;
        var project = new Project
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
        try
        {
            var result = projectRepository.SaveChanges();
            if (result)
                return Created();

            return StatusCode(StatusCodes.Status500InternalServerError, "The project was not saved");
        }
        catch (Exception)
        {
            return StatusCode(500, "There was a problem storing the project on the database");
        }
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