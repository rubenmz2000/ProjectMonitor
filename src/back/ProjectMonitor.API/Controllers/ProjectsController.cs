using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ProjectMonitor.Core;
using ProjectMonitor.Core.DTOs;
using ProjectMonitor.Core.Entities;
using ProjectMonitor.Core.Enums;

namespace ProjectMonitor.API.Controllers;

[Route("api/[controller]")]
[ApiController]
public class ProjectsController(IRepository<Project> projectRepository) : ControllerBase
{
    [HttpGet]
    public IActionResult GetAll()
    {
        return Ok(projectRepository.GetAll(p => !p.IsDeleted)
            .OrderByDescending(p => p.UpdatedAt)
            .Select(p => new ProjectResponseDto
            {
                Id = p.Id,
                Name = p.Name,
                Description = p.Description,
                IssuePrefix = p.IssuePrefix,
                Status = p.Status,
                UpdatedAt = p.UpdatedAt
            })
            .ToList());
    }

    [HttpGet("{id:guid}")]
    public IActionResult GetById(Guid id)
    {
        var project = projectRepository.GetById(id);
        if (project == null) return NotFound();
        return Ok(new ProjectResponseDto
        {
            Id = project.Id,
            Name = project.Name,
            Description = project.Description,
            IssuePrefix = project.IssuePrefix,
            Status = project.Status,
            UpdatedAt = project.UpdatedAt
        });
    }

    /// <summary>
    /// Resolves a project by its human issue prefix (e.g. "PM"). The length constraint keeps this
    /// route from overlapping with the GUID route above (a GUID is always longer than 5 chars).
    /// </summary>
    [HttpGet("{prefix:length(1,5)}")]
    public IActionResult GetByPrefix(string prefix)
    {
        var normalized = prefix.ToUpperInvariant();
        var project = projectRepository.GetAll(p => p.IssuePrefix == normalized && !p.IsDeleted).FirstOrDefault();
        if (project == null) return NotFound();
        return Ok(new ProjectResponseDto
        {
            Id = project.Id,
            Name = project.Name,
            Description = project.Description,
            IssuePrefix = project.IssuePrefix,
            Status = project.Status,
            UpdatedAt = project.UpdatedAt
        });
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
                IssuePrefix = p.IssuePrefix,
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
        
        // Auto-generate IssuePrefix if empty or null
        var issuePrefix = string.IsNullOrWhiteSpace(projectDto.IssuePrefix) 
            ? GenerateIssuePrefix(projectDto.Name) 
            : projectDto.IssuePrefix;
        
        // Normalize to uppercase and remove non-alphanumeric characters
        issuePrefix = new string(issuePrefix.ToUpperInvariant().Where(char.IsLetterOrDigit).Take(5).ToArray());
        
        // Validate IssuePrefix uniqueness
        var prefixExists = projectRepository.GetAll(p => p.IssuePrefix == issuePrefix && !p.IsDeleted).Any();
        if (prefixExists)
            return BadRequest($"Issue prefix '{issuePrefix}' is already in use. Please choose a different one.");
        
        var now = DateTime.UtcNow;
        var project = new Project
        {
            Id = Guid.NewGuid(),
            Name = projectDto.Name,
            Description = projectDto.Description,
            IssuePrefix = issuePrefix,
            CreationDate = now,
            UpdatedAt = now,
            Status = ProjectStatus.NotStarted,
            IsDeleted = false,
            Issues = []
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
    
    private string GenerateIssuePrefix(string projectName)
    {
        var words = projectName.Split(' ', StringSplitOptions.RemoveEmptyEntries);
        
        if (words.Length > 1)
        {
            // Multiple words: take initials
            return new string(words.Select(w => w[0]).Take(5).ToArray());
        }
        else
        {
            // Single word: take first 3 characters
            var cleanName = new string(projectName.Where(char.IsLetterOrDigit).ToArray());
            return cleanName.Length >= 3 ? cleanName[..3] : cleanName;
        }
    }

    [HttpPut("{id:guid}")]
    public IActionResult Update(Guid id, [FromBody] CreateProjectDto projectDto)
    {
        var project = projectRepository.GetById(id);
        if (project == null) return NotFound();
        project.Name = projectDto.Name;
        project.Description = projectDto.Description;
        project.IssuePrefix = projectDto.IssuePrefix.ToUpperInvariant();
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
