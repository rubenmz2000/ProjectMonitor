using Microsoft.AspNetCore.Mvc;
using ProjectMonitor.Core;
using ProjectMonitor.Core.DTOs;
using ProjectMonitor.Core.Entities;

namespace ProjectMonitor.API.Controllers;

[Route("api/issues")]
[ApiController]
public class IssuesController(IRepository<Project> projectRepository, IRepository<ProjectTask> taskRepository) : ControllerBase
{
    [HttpGet("{taskIdentifier}")]
    public IActionResult GetByTaskIdentifier(string taskIdentifier)
    {
        // Validate format: should be PREFIX-NUMBER (e.g., PM-001)
        var lastDashIndex = taskIdentifier.LastIndexOf('-');
        if (lastDashIndex <= 0 || lastDashIndex >= taskIdentifier.Length - 1)
            return BadRequest("Invalid task identifier format");

        var prefix = taskIdentifier[..lastDashIndex].ToUpperInvariant();
        var numberPart = taskIdentifier[(lastDashIndex + 1)..];
        
        if (!int.TryParse(numberPart, out int taskNumber))
            return BadRequest("Invalid task identifier format: number part is not valid");

        // Find project by TaskPrefix
        var project = projectRepository.GetAll(p => p.TaskPrefix == prefix && !p.IsDeleted).FirstOrDefault();
        if (project == null)
            return NotFound("Project not found for the given task prefix");

        // Find task by ProjectId and TaskNumber
        var task = taskRepository.GetAll(t => t.ProjectId == project.Id && t.TaskNumber == taskNumber && !t.IsDeleted).FirstOrDefault();
        if (task == null)
            return NotFound("Task not found");

        var response = new TaskDetailResponseDto
        {
            Id = task.Id,
            TaskNumber = task.TaskNumber,
            TaskIdentifier = $"{project.TaskPrefix}-{task.TaskNumber:D3}",
            Title = task.Title,
            Description = task.Description,
            Status = task.Status,
            Priority = task.Priority,
            DueDate = task.DueDate == DateTime.MinValue ? null : task.DueDate,
            CreationDate = task.CreationDate,
            UpdatedAt = task.UpdatedAt,
            ProjectName = project.Name,
            TaskPrefix = project.TaskPrefix
        };

        return Ok(response);
    }
}
