using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ProjectMonitor.API.Services;
using ProjectMonitor.Core;
using ProjectMonitor.Core.DTOs;
using ProjectMonitor.Core.Entities;
using ProjectMonitor.Core.Enums;

namespace ProjectMonitor.API.Controllers;

[Route("api/projects/{projectId:guid}/issues")]
[ApiController]
public class ProjectIssuesController(
    IRepository<Project> projectRepository,
    IRepository<Issue> issueRepository,
    IRepository<IssueActivity> activityRepository,
    ICurrentActorResolver currentActor) : ControllerBase
{
    [HttpGet]
    public IActionResult GetIssues(Guid projectId)
    {
        var project = projectRepository.GetById(projectId);
        if (project == null) return NotFound();

        var issues = issueRepository.GetAll(i => i.ProjectId == projectId && !i.IsDeleted)
            .Include(i => i.CreatedBy)
            .Include(i => i.Assignee)
            .OrderBy(i => i.IssueNumber)
            .Select(i => new IssueResponseDto
            {
                Id = i.Id,
                IssueNumber = i.IssueNumber,
                IssueIdentifier = $"{project.IssuePrefix}-{i.IssueNumber:D3}",
                Title = i.Title,
                Description = i.Description,
                Status = i.Status,
                Priority = i.Priority,
                DueDate = i.DueDate,
                CreationDate = i.CreationDate,
                UpdatedAt = i.UpdatedAt,
                CreatedBy = new ActorDto
                {
                    Id = i.CreatedBy.Id,
                    DisplayName = i.CreatedBy.DisplayName,
                    Identifier = i.CreatedBy.Identifier,
                    Kind = i.CreatedBy.Kind.ToString()
                },
                Assignee = i.Assignee != null ? new ActorDto
                {
                    Id = i.Assignee.Id,
                    DisplayName = i.Assignee.DisplayName,
                    Identifier = i.Assignee.Identifier,
                    Kind = i.Assignee.Kind.ToString()
                } : null
            })
            .ToList();

        return Ok(issues);
    }

    [HttpPost]
    public IActionResult CreateIssue(Guid projectId, [FromBody] CreateIssueDto issueDto)
    {
        var project = projectRepository.GetById(projectId);
        if (project == null) return NotFound("Project not found");

        var actor = currentActor.Resolve();
        if (actor == null)
            return BadRequest($"Missing or unknown {CurrentActorResolver.HeaderName} header");

        // Generate IssueNumber using MAX+1 strategy
        var allIssuesForProject = issueRepository.GetAll(i => i.ProjectId == projectId).ToList();

        int nextNumber = 1;
        if (allIssuesForProject.Any())
        {
            nextNumber = allIssuesForProject.Max(i => i.IssueNumber) + 1;
        }

        var now = DateTime.UtcNow;
        var issue = new Issue
        {
            Id = Guid.NewGuid(),
            IssueNumber = nextNumber,
            Title = issueDto.Title,
            Description = issueDto.Description,
            Status = IssueStatus.ToDo,
            Priority = issueDto.Priority,
            DueDate = issueDto.DueDate ?? DateTime.MinValue,
            ProjectId = projectId,
            CreatedById = actor.Id,
            AssigneeId = null,
            CreationDate = now,
            UpdatedAt = now,
            IsDeleted = false
        };

        issueRepository.Add(issue);
        activityRepository.Add(new IssueActivity
        {
            Id = Guid.NewGuid(),
            IssueId = issue.Id,
            ActorId = actor.Id,
            OccurredAt = now,
            Type = IssueActivityType.Created
        });
        try
        {
            var result = issueRepository.SaveChanges();
            if (result)
            {
                var response = new IssueResponseDto
                {
                    Id = issue.Id,
                    IssueNumber = issue.IssueNumber,
                    IssueIdentifier = $"{project.IssuePrefix}-{issue.IssueNumber:D3}",
                    Title = issue.Title,
                    Description = issue.Description,
                    Status = issue.Status,
                    Priority = issue.Priority,
                    DueDate = issue.DueDate == DateTime.MinValue ? null : issue.DueDate,
                    CreationDate = issue.CreationDate,
                    UpdatedAt = issue.UpdatedAt,
                    CreatedBy = new ActorDto
                    {
                        Id = actor.Id,
                        DisplayName = actor.DisplayName,
                        Identifier = actor.Identifier,
                        Kind = actor.Kind.ToString()
                    },
                    Assignee = null
                };
                return CreatedAtAction(nameof(GetIssues), new { projectId }, response);
            }

            return StatusCode(StatusCodes.Status500InternalServerError, "The issue was not saved");
        }
        catch (Exception)
        {
            return StatusCode(500, "There was a problem storing the issue on the database");
        }
    }
}
