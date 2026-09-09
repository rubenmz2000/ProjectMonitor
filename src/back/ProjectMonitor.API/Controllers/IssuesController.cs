using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ProjectMonitor.Core;
using ProjectMonitor.Core.DTOs;
using ProjectMonitor.Core.Entities;

namespace ProjectMonitor.API.Controllers;

[Route("api/issues")]
[ApiController]
public class IssuesController(IRepository<Project> projectRepository, IRepository<ProjectTask> taskRepository, IRepository<Actor> actorRepository) : ControllerBase
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

        // Find task with navigation properties loaded
        var task = taskRepository.GetAll(t => t.ProjectId == project.Id && t.TaskNumber == taskNumber && !t.IsDeleted)
            .Include(t => t.CreatedBy)
            .Include(t => t.Assignee)
            .FirstOrDefault();
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
            TaskPrefix = project.TaskPrefix,
            CreatedBy = MapActor(task.CreatedBy),
            Assignee = task.Assignee != null ? MapActor(task.Assignee) : null
        };

        return Ok(response);
    }

    [HttpPatch("{taskIdentifier}/assign")]
    public IActionResult UpdateAssignee(string taskIdentifier, [FromBody] UpdateAssigneeDto dto)
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

        // Find task with navigation properties loaded
        var task = taskRepository.GetAll(t => t.ProjectId == project.Id && t.TaskNumber == taskNumber && !t.IsDeleted)
            .Include(t => t.CreatedBy)
            .Include(t => t.Assignee)
            .FirstOrDefault();
        if (task == null)
            return NotFound("Task not found");

        // Validate assignee if provided
        if (dto.AssigneeId.HasValue)
        {
            var assignee = actorRepository.GetAll(a => a.Id == dto.AssigneeId.Value && a.IsActive).FirstOrDefault();
            if (assignee == null)
                return NotFound("Assignee not found");
        }

        task.AssigneeId = dto.AssigneeId;
        task.UpdatedAt = DateTime.UtcNow;

        taskRepository.Update(task);
        var saved = taskRepository.SaveChanges();
        if (!saved)
            return StatusCode(500, "Failed to update assignee");

        // Reload with navigation properties after save
        var updatedTask = taskRepository.GetAll(t => t.Id == task.Id)
            .Include(t => t.CreatedBy)
            .Include(t => t.Assignee)
            .First();

        var response = new TaskDetailResponseDto
        {
            Id = updatedTask.Id,
            TaskNumber = updatedTask.TaskNumber,
            TaskIdentifier = $"{project.TaskPrefix}-{updatedTask.TaskNumber:D3}",
            Title = updatedTask.Title,
            Description = updatedTask.Description,
            Status = updatedTask.Status,
            Priority = updatedTask.Priority,
            DueDate = updatedTask.DueDate == DateTime.MinValue ? null : updatedTask.DueDate,
            CreationDate = updatedTask.CreationDate,
            UpdatedAt = updatedTask.UpdatedAt,
            ProjectName = project.Name,
            TaskPrefix = project.TaskPrefix,
            CreatedBy = MapActor(updatedTask.CreatedBy),
            Assignee = updatedTask.Assignee != null ? MapActor(updatedTask.Assignee) : null
        };

        return Ok(response);
    }

    private static ActorDto MapActor(Actor actor) => new()
    {
        Id = actor.Id,
        DisplayName = actor.DisplayName,
        Identifier = actor.Identifier,
        Kind = actor.Kind.ToString()
    };
}
