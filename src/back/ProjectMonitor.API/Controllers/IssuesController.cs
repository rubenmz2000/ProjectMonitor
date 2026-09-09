using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ProjectMonitor.API.Services;
using ProjectMonitor.Core;
using ProjectMonitor.Core.DTOs;
using ProjectMonitor.Core.Entities;
using ProjectMonitor.Core.Enums;

namespace ProjectMonitor.API.Controllers;

[Route("api/issues")]
[ApiController]
public class IssuesController(
    IRepository<Project> projectRepository,
    IRepository<Issue> issueRepository,
    IRepository<Actor> actorRepository,
    IRepository<IssueActivity> activityRepository,
    ICurrentActorResolver currentActor) : ControllerBase
{
    private const string UnassignedLabel = "Unassigned";

    [HttpGet("{issueIdentifier}")]
    public IActionResult GetByIssueIdentifier(string issueIdentifier)
    {
        var error = TryResolveIssue(issueIdentifier, out var project, out var issue);
        if (error != null) return error;

        return Ok(MapDetail(issue!, project!));
    }

    [HttpPatch("{issueIdentifier}/assign")]
    public IActionResult UpdateAssignee(string issueIdentifier, [FromBody] UpdateAssigneeDto dto)
    {
        var actor = currentActor.Resolve();
        if (actor == null)
            return BadRequest($"Missing or unknown {CurrentActorResolver.HeaderName} header");

        var error = TryResolveIssue(issueIdentifier, out var project, out var issue);
        if (error != null) return error;

        // Validate assignee if provided
        if (dto.AssigneeId.HasValue)
        {
            var assignee = actorRepository.GetAll(a => a.Id == dto.AssigneeId.Value && a.IsActive).FirstOrDefault();
            if (assignee == null)
                return NotFound("Assignee not found");
        }

        // Same assignee: nothing changed, nothing recorded (use a comment to leave text)
        if (issue!.AssigneeId == dto.AssigneeId)
            return Ok(MapDetail(issue, project!));

        var now = DateTime.UtcNow;
        var activity = new IssueActivity
        {
            Id = Guid.NewGuid(),
            IssueId = issue.Id,
            ActorId = actor.Id,
            OccurredAt = now,
            Type = IssueActivityType.AssigneeChanged,
            OldValue = issue.AssigneeId?.ToString(),
            NewValue = dto.AssigneeId?.ToString(),
            Body = NormalizeText(dto.Note)
        };

        issue.AssigneeId = dto.AssigneeId;
        issue.UpdatedAt = now;

        issueRepository.Update(issue);
        activityRepository.Add(activity);

        // Same DbContext: the issue change and its activity are saved together
        var saved = issueRepository.SaveChanges();
        if (!saved)
            return StatusCode(500, "Failed to update assignee");

        // Reload with navigation properties after save
        var updatedIssue = issueRepository.GetAll(i => i.Id == issue.Id)
            .Include(i => i.CreatedBy)
            .Include(i => i.Assignee)
            .First();

        return Ok(MapDetail(updatedIssue, project!));
    }

    [HttpGet("{issueIdentifier}/activity")]
    public IActionResult GetActivity(string issueIdentifier)
    {
        var error = TryResolveIssue(issueIdentifier, out _, out var issue);
        if (error != null) return error;

        var activities = activityRepository.GetAll(a => a.IssueId == issue!.Id)
            .Include(a => a.Actor)
            .OrderBy(a => a.OccurredAt)
            .ThenBy(a => a.Id)
            .ToList();

        // Resolve labels for actor ids stored as values (assignee changes), including inactive actors
        var actorIds = activities
            .Where(a => a.Type == IssueActivityType.AssigneeChanged)
            .SelectMany(a => new[] { a.OldValue, a.NewValue })
            .Where(v => v != null)
            .Select(v => Guid.TryParse(v, out var id) ? id : (Guid?)null)
            .Where(id => id.HasValue)
            .Select(id => id!.Value)
            .Distinct()
            .ToList();

        var actorNames = actorIds.Count == 0
            ? new Dictionary<Guid, string>()
            : actorRepository.GetAll(a => actorIds.Contains(a.Id))
                .ToDictionary(a => a.Id, a => a.DisplayName);

        var response = activities.Select(a => MapActivity(a, actorNames)).ToList();
        return Ok(response);
    }

    [HttpPost("{issueIdentifier}/comments")]
    public IActionResult AddComment(string issueIdentifier, [FromBody] CreateCommentDto dto)
    {
        var actor = currentActor.Resolve();
        if (actor == null)
            return BadRequest($"Missing or unknown {CurrentActorResolver.HeaderName} header");

        var body = NormalizeText(dto.Body);
        if (body == null)
            return BadRequest("Comment body cannot be empty");

        var error = TryResolveIssue(issueIdentifier, out _, out var issue);
        if (error != null) return error;

        var now = DateTime.UtcNow;
        var activity = new IssueActivity
        {
            Id = Guid.NewGuid(),
            IssueId = issue!.Id,
            ActorId = actor.Id,
            OccurredAt = now,
            Type = IssueActivityType.Comment,
            Body = body
        };

        issue.UpdatedAt = now;
        issueRepository.Update(issue);
        activityRepository.Add(activity);

        var saved = activityRepository.SaveChanges();
        if (!saved)
            return StatusCode(500, "Failed to add comment");

        activity.Actor = actor;
        return CreatedAtAction(nameof(GetActivity), new { issueIdentifier }, MapActivity(activity, new Dictionary<Guid, string>()));
    }

    /// <summary>
    /// Resolves an issue from its human identifier (PREFIX-NNN). Returns an error result to
    /// return to the client, or null when the issue was found.
    /// </summary>
    private IActionResult? TryResolveIssue(string issueIdentifier, out Project? project, out Issue? issue)
    {
        project = null;
        issue = null;

        // Validate format: should be PREFIX-NUMBER (e.g., PM-001)
        var lastDashIndex = issueIdentifier.LastIndexOf('-');
        if (lastDashIndex <= 0 || lastDashIndex >= issueIdentifier.Length - 1)
            return BadRequest("Invalid issue identifier format");

        var prefix = issueIdentifier[..lastDashIndex].ToUpperInvariant();
        var numberPart = issueIdentifier[(lastDashIndex + 1)..];

        if (!int.TryParse(numberPart, out int issueNumber))
            return BadRequest("Invalid issue identifier format: number part is not valid");

        // Find project by IssuePrefix
        project = projectRepository.GetAll(p => p.IssuePrefix == prefix && !p.IsDeleted).FirstOrDefault();
        if (project == null)
            return NotFound("Project not found for the given issue prefix");

        // Find issue with navigation properties loaded
        var projectId = project.Id;
        issue = issueRepository.GetAll(i => i.ProjectId == projectId && i.IssueNumber == issueNumber && !i.IsDeleted)
            .Include(i => i.CreatedBy)
            .Include(i => i.Assignee)
            .FirstOrDefault();
        if (issue == null)
            return NotFound("Issue not found");

        return null;
    }

    private static IssueDetailResponseDto MapDetail(Issue issue, Project project) => new()
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

    private static IssueActivityDto MapActivity(IssueActivity activity, IReadOnlyDictionary<Guid, string> actorNames)
    {
        var isChange = activity.Type == IssueActivityType.AssigneeChanged;
        return new IssueActivityDto
        {
            Id = activity.Id,
            Type = activity.Type,
            OccurredAt = activity.OccurredAt,
            Actor = MapActor(activity.Actor),
            From = isChange ? MapAssigneeValue(activity.OldValue, actorNames) : null,
            To = isChange ? MapAssigneeValue(activity.NewValue, actorNames) : null,
            Body = activity.Body
        };
    }

    private static ActivityValueDto MapAssigneeValue(string? value, IReadOnlyDictionary<Guid, string> actorNames)
    {
        if (value == null)
            return new ActivityValueDto { Value = null, Label = UnassignedLabel };

        var label = Guid.TryParse(value, out var id) && actorNames.TryGetValue(id, out var name) ? name : value;
        return new ActivityValueDto { Value = value, Label = label };
    }

    private static string? NormalizeText(string? text)
    {
        var trimmed = text?.Trim();
        return string.IsNullOrEmpty(trimmed) ? null : trimmed;
    }

    private static ActorDto MapActor(Actor actor) => new()
    {
        Id = actor.Id,
        DisplayName = actor.DisplayName,
        Identifier = actor.Identifier,
        Kind = actor.Kind.ToString()
    };
}
