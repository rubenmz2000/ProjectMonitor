using System.Linq.Expressions;
using ProjectMonitor.Core;
using ProjectMonitor.Core.Entities;
using ProjectMonitor.DataAccess.Data;

namespace ProjectMonitor.DataAccess.Repositories;

/// <summary>Append-only: activities are never updated or deleted.</summary>
public class IssueActivityRepository(AppDbContext dbContext) : IRepository<IssueActivity>
{
    public IQueryable<IssueActivity> GetAll(Expression<Func<IssueActivity, bool>> predicate = null!)
    {
        IQueryable<IssueActivity> query = dbContext.IssueActivities;

        if (predicate != null!)
            query = query.Where(predicate!);
        return query;
    }

    public IssueActivity? GetById(Guid id)
    {
        return dbContext.IssueActivities.FirstOrDefault(a => a.Id == id);
    }

    public void Add(IssueActivity item)
    {
        dbContext.IssueActivities.Add(item);
    }

    public void Update(IssueActivity item)
    {
        throw new NotSupportedException("Issue activities are append-only and cannot be updated.");
    }

    public void Delete(Guid id)
    {
        throw new NotSupportedException("Issue activities are append-only and cannot be deleted.");
    }

    public bool SaveChanges()
    {
        return dbContext.SaveChanges() > 0;
    }
}
