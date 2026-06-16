using System.Linq.Expressions;
using ProjectMonitor.Core;
using ProjectMonitor.Core.Entities;
using ProjectMonitor.DataAccess.Data;

namespace ProjectMonitor.DataAccess.Repositories;

public class ProjectRepository(AppDbContext dbContext) : IRepository<Project>
{
    public IQueryable<Project> GetAll(Expression<Func<Project, bool>> predicate = null!)
    {
        IQueryable<Project> query = dbContext.Projects;

        if (predicate != null!)
            query = query.Where(predicate!);
        return query;
    }

    public Project? GetById(Guid id)
    {
        return dbContext.Projects.Where(p => !p.IsDeleted).FirstOrDefault(p => p.Id == id);
    }

    public IEnumerable<Project> GetLatest()
    { 
        return dbContext.Projects.Where(p => !p.IsDeleted).OrderByDescending(p => p.UpdatedAt).Take(3).ToList();
    }

    public void Add(Project item)
    {
        dbContext.Projects.Add(item);
    }

    public void Update(Project item)
    {
        dbContext.Projects.Update(item);
    }

    public void Delete(Guid id)
    {
        var project = GetById(id);
        if (project == null) return;
        if (project.IsDeleted) return;
        project.IsDeleted = true;
    }

    public bool SaveChanges()
    {
        return dbContext.SaveChanges() > 0;
    }
}