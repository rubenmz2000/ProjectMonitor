using System.Linq.Expressions;
using ProjectMonitor.Core;
using ProjectMonitor.Core.Entities;
using ProjectMonitor.DataAccess.Data;

namespace ProjectMonitor.DataAccess.Repositories;

public class IssueRepository(AppDbContext dbContext) : IRepository<Issue>
{
    public IQueryable<Issue> GetAll(Expression<Func<Issue, bool>> predicate = null!)
    {
        IQueryable<Issue> query = dbContext.Issues;

        if (predicate != null!)
            query = query.Where(predicate!);
        return query;
    }

    public Issue? GetById(Guid id)
    {
        return dbContext.Issues.FirstOrDefault(i => i.Id == id);
    }

    public void Add(Issue item)
    {
        dbContext.Issues.Add(item);
    }

    public void Update(Issue item)
    {
        dbContext.Issues.Update(item);
    }

    public void Delete(Guid id)
    {
        var issue = GetById(id);
        if (issue == null) return;
        if (issue.IsDeleted) return;
        issue.IsDeleted = true;
    }

    public bool SaveChanges()
    {
        return dbContext.SaveChanges() > 0;
    }
}