using System.Linq.Expressions;
using ProjectMonitor.Core;
using ProjectMonitor.Core.Entities;
using ProjectMonitor.DataAccess.Data;

namespace ProjectMonitor.DataAccess.Repositories;

public class ProjectTaskRepository(AppDbContext dbContext) : IRepository<ProjectTask>
{
    public IQueryable<ProjectTask> GetAll(Expression<Func<ProjectTask, bool>> predicate = null!)
    {
        IQueryable<ProjectTask> query = dbContext.Tasks;

        if (predicate != null!)
            query = query.Where(predicate!);
        return query;
    }

    public ProjectTask? GetById(Guid id)
    {
        return dbContext.Tasks.FirstOrDefault(p => p.Id == id);
    }

    public void Add(ProjectTask item)
    {
        dbContext.Tasks.Add(item);
    }

    public void Update(ProjectTask item)
    {
        dbContext.Tasks.Update(item);
    }

    public void Delete(Guid id)
    {
        var task = GetById(id);
        if (task == null) return;
        if (task.IsDeleted) return;
        task.IsDeleted = true;
    }

    public bool SaveChanges()
    {
        return dbContext.SaveChanges() > 0;
    }
}