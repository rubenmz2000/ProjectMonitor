using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ProjectMonitor.Core;
using ProjectMonitor.Core.DTOs;
using ProjectMonitor.Core.Entities;

namespace ProjectMonitor.API.Controllers;

[Route("api/issues")]
[ApiController]
public class IssuesController(IRepository<Project> projectRepository, IRepository<Issue> issueRepository, IRepository<Actor> actorRepository) : ControllerBase
{
    [HttpGet("{issueIdentifier}")]
    public IActionResult GetByIssueIdentifier(string issueIdentifier)
    {
        // Validate format: should be PREFIX-NUMBER (e.g., PM-001)
        var lastDashIndex = issueIdentifier.LastIndexOf('-');
        if (lastDashIndex <= 0 || lastDashIndex >= issueIdentifier.Length - 1)
            return BadRequest("Invalid issue identifier format");

        var prefix = issueIdentifier[..lastDashIndex].ToUpperInvariant();
        var numberPart = issueIdentifier[(lastDashIndex + 1)..];

        if (!int.TryParse(numberPart, out int issueNumber))
            return BadRequest("Invalid issue identifier format: number part is not valid");

        // Find project by IssuePrefix
        var project = projectRepository.GetAll(p => p.IssuePrefix == prefix && !p.IsDeleted).FirstOrDefault();
        if (project == null)
            return NotFound("Project not found for the given issue prefix");

        // Find issue with navigation properties loaded
        var issue = issueRepository.GetAll(i => i.ProjectId == project.Id && i.IssueNumber == issueNumber && !i.IsDeleted)
            .Include(i => i.CreatedBy)
            .Include(i => i.Assignee)
            .FirstOrDefault();
        if (issue == null)
            return NotFound("Issue not found");

        var response = new IssueDetailResponseDto
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
            ProjectName = project.Name,
            IssuePrefix = project.IssuePrefix,
            CreatedBy = MapActor(issue.CreatedBy),
            Assignee = issue.Assignee != null ? MapActor(issue.Assignee) : null
        };

        return Ok(response);
    }

    [HttpPatch("{issueIdentifier}/assign")]
    public IActionResult UpdateAssignee(string issueIdentifier, [FromBody] UpdateAssigneeDto dto)
    {
        // Validate format: should be PREFIX-NUMBER (e.g., PM-001)
        var lastDashIndex = issueIdentifier.LastIndexOf('-');
        if (lastDashIndex <= 0 || lastDashIndex >= issueIdentifier.Length - 1)
            return BadRequest("Invalid issue identifier format");

        var prefix = issueIdentifier[..lastDashIndex].ToUpperInvariant();
        var numberPart = issueIdentifier[(lastDashIndex + 1)..];

        if (!int.TryParse(numberPart, out int issueNumber))
            return BadRequest("Invalid issue identifier format: number part is not valid");

        // Find project by IssuePrefix
        var project = projectRepository.GetAll(p => p.IssuePrefix == prefix && !p.IsDeleted).FirstOrDefault();
        if (project == null)
            return NotFound("Project not found for the given issue prefix");

        // Find issue with navigation properties loaded
        var issue = issueRepository.GetAll(i => i.ProjectId == project.Id && i.IssueNumber == issueNumber && !i.IsDeleted)
            .Include(i => i.CreatedBy)
            .Include(i => i.Assignee)
            .FirstOrDefault();
        if (issue == null)
            return NotFound("Issue not found");

        // Validate assignee if provided
        if (dto.AssigneeId.HasValue)
        {
            var assignee = actorRepository.GetAll(a => a.Id == dto.AssigneeId.Value && a.IsActive).FirstOrDefault();
            if (assignee == null)
                return NotFound("Assignee not found");
        }

        issue.AssigneeId = dto.AssigneeId;
        issue.UpdatedAt = DateTime.UtcNow;

        issueRepository.Update(issue);
        var saved = issueRepository.SaveChanges();
        if (!saved)
            return StatusCode(500, "Failed to update assignee");

        // Reload with navigation properties after save
        var updatedIssue = issueRepository.GetAll(i => i.Id == issue.Id)
            .Include(i => i.CreatedBy)
            .Include(i => i.Assignee)
            .First();

        var response = new IssueDetailResponseDto
        {
            Id = updatedIssue.Id,
            IssueNumber = updatedIssue.IssueNumber,
            IssueIdentifier = $"{project.IssuePrefix}-{updatedIssue.IssueNumber:D3}",
            Title = updatedIssue.Title,
            Description = updatedIssue.Description,
            Status = updatedIssue.Status,
            Priority = updatedIssue.Priority,
            DueDate = updatedIssue.DueDate == DateTime.MinValue ? null : updatedIssue.DueDate,
            CreationDate = updatedIssue.CreationDate,
            UpdatedAt = updatedIssue.UpdatedAt,
            ProjectName = project.Name,
            IssuePrefix = project.IssuePrefix,
            CreatedBy = MapActor(updatedIssue.CreatedBy),
            Assignee = updatedIssue.Assignee != null ? MapActor(updatedIssue.Assignee) : null
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
