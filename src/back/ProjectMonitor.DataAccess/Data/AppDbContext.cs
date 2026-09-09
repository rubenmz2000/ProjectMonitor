using Microsoft.EntityFrameworkCore;
using ProjectMonitor.Core.Entities;

namespace ProjectMonitor.DataAccess.Data;

public class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options: options)
{
    public DbSet<Project> Projects { get; set; }
    public DbSet<Issue> Issues { get; set; }
    public DbSet<Actor> Actors { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(AppDbContext).Assembly);
    }
}