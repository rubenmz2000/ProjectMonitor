using System.Linq.Expressions;
using Microsoft.EntityFrameworkCore;
using ProjectMonitor.Core;
using ProjectMonitor.Core.Entities;
using ProjectMonitor.DataAccess.Data;

namespace ProjectMonitor.DataAccess.Repositories;

public class ActorRepository(AppDbContext dbContext) : IRepository<Actor>
{
    public IQueryable<Actor> GetAll(Expression<Func<Actor, bool>> predicate = null!)
    {
        IQueryable<Actor> query = dbContext.Actors;

        if (predicate != null!)
            query = query.Where(predicate!);
        return query;
    }

    public Actor? GetById(Guid id)
    {
        return dbContext.Actors.FirstOrDefault(a => a.Id == id);
    }

    public void Add(Actor item)
    {
        dbContext.Actors.Add(item);
    }

    public void Update(Actor item)
    {
        dbContext.Actors.Update(item);
    }

    public void Delete(Guid id)
    {
        // Actors are not soft-deleted; use IsActive = false instead.
        var actor = GetById(id);
        if (actor == null) return;
        actor.IsActive = false;
    }

    public bool SaveChanges()
    {
        return dbContext.SaveChanges() > 0;
    }
}
