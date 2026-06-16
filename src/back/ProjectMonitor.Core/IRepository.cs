using System.Linq.Expressions;
using ProjectMonitor.Core.Entities;

namespace ProjectMonitor.Core;

public interface IRepository<T> where T : class
{
    public IQueryable<T> GetAll(Expression<Func<T, bool>> predicate = null!);
    public T? GetById(Guid id);
    public void Add(T item);
    public void Update(T item);
    public void Delete(Guid id);
    public bool SaveChanges();
}