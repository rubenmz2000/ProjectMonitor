using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ProjectMonitor.Core;
using ProjectMonitor.Core.DTOs;
using ProjectMonitor.Core.Entities;
using ProjectMonitor.Core.Enums;

namespace ProjectMonitor.API.Controllers;

[Route("api/projects/{projectId:guid}/tasks")]
[ApiController]
public class TasksController(IRepository<Project> projectRepository, IRepository<ProjectTask> taskRepository, IRepository<Actor> actorRepository) : ControllerBase
{
    [HttpGet]
    public IActionResult GetTasks(Guid projectId)
    {
        var project = projectRepository.GetById(projectId);
        if (project == null) return NotFound();

        var tasks = taskRepository.GetAll(t => t.ProjectId == projectId && !t.IsDeleted)
            .Include(t => t.CreatedBy)
            .Include(t => t.Assignee)
            .OrderBy(t => t.TaskNumber)
            .Select(t => new TaskResponseDto
            {
                Id = t.Id,
                TaskNumber = t.TaskNumber,
                TaskIdentifier = $"{project.TaskPrefix}-{t.TaskNumber:D3}",
                Title = t.Title,
                Description = t.Description,
                Status = t.Status,
                Priority = t.Priority,
                DueDate = t.DueDate,
                CreationDate = t.CreationDate,
                UpdatedAt = t.UpdatedAt,
                CreatedBy = new ActorDto
                {
                    Id = t.CreatedBy.Id,
                    DisplayName = t.CreatedBy.DisplayName,
                    Identifier = t.CreatedBy.Identifier,
                    Kind = t.CreatedBy.Kind.ToString()
                },
                Assignee = t.Assignee != null ? new ActorDto
                {
                    Id = t.Assignee.Id,
                    DisplayName = t.Assignee.DisplayName,
                    Identifier = t.Assignee.Identifier,
                    Kind = t.Assignee.Kind.ToString()
                } : null
            })
            .ToList();

        return Ok(tasks);
    }

    [HttpPost]
    public IActionResult CreateTask(Guid projectId, [FromBody] CreateTaskDto taskDto)
    {
        var project = projectRepository.GetById(projectId);
        if (project == null) return NotFound("Project not found");

        // Resolve actor from header
        var actorIdentifier = Request.Headers["X-Actor-Identifier"].FirstOrDefault();
        if (string.IsNullOrWhiteSpace(actorIdentifier))
            return BadRequest("Missing X-Actor-Identifier header");

        var actor = actorRepository.GetAll(a => a.Identifier == actorIdentifier && a.IsActive).FirstOrDefault();
        if (actor == null) return NotFound("Actor not found");

        // Generate TaskNumber using MAX+1 strategy
        var allTasksForProject = taskRepository.GetAll(t => t.ProjectId == projectId).ToList();
        
        int nextNumber = 1;
        if (allTasksForProject.Any())
        {
            nextNumber = allTasksForProject.Max(t => t.TaskNumber) + 1;
        }

        var now = DateTime.UtcNow;
        var task = new ProjectTask
        {
            Id = Guid.NewGuid(),
            TaskNumber = nextNumber,
            Title = taskDto.Title,
            Description = taskDto.Description,
            Status = ProjectTaskStatus.ToDo,
            Priority = taskDto.Priority,
            DueDate = taskDto.DueDate ?? DateTime.MinValue,
            ProjectId = projectId,
            CreatedById = actor.Id,
            AssigneeId = null,
            CreationDate = now,
            UpdatedAt = now,
            IsDeleted = false
        };

        taskRepository.Add(task);
        try
        {
            var result = taskRepository.SaveChanges();
            if (result)
            {
                var response = new TaskResponseDto
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
                    CreatedBy = new ActorDto
                    {
                        Id = actor.Id,
                        DisplayName = actor.DisplayName,
                        Identifier = actor.Identifier,
                        Kind = actor.Kind.ToString()
                    },
                    Assignee = null
                };
                return CreatedAtAction(nameof(GetTasks), new { projectId }, response);
            }

            return StatusCode(StatusCodes.Status500InternalServerError, "The task was not saved");
        }
        catch (Exception)
        {
            return StatusCode(500, "There was a problem storing the task on the database");
        }
    }
}
