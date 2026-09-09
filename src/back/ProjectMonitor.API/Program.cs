using Microsoft.EntityFrameworkCore;
using ProjectMonitor.API.Extensions;
using ProjectMonitor.Core;
using ProjectMonitor.Core.Entities;
using ProjectMonitor.DataAccess.Data;
using ProjectMonitor.DataAccess.Repositories;
using System.Text.Json.Serialization;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
builder.Services.AddOpenApi();
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

builder.Services.AddScoped<IRepository<Project>, ProjectRepository>();
builder.Services.AddScoped<IRepository<Issue>, IssueRepository>();
builder.Services.AddScoped<IRepository<Actor>, ActorRepository>();
builder.Services.AddScoped<IRepository<IssueActivity>, IssueActivityRepository>();
builder.Services.AddCurrentActor();
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowConnections", optionsBuilder =>
    {
        optionsBuilder.WithOrigins(builder.Configuration.GetSection("CorsOrigins").Get<string[]>() ?? throw new ArgumentNullException(nameof(optionsBuilder), "Cors not set in configuration. Usage: \n\"CorsOrigins\": []"))
            .AllowAnyHeader()
            .AllowAnyMethod();
    });
});

builder.Services.AddControllers().AddJsonOptions(options =>
{
    options.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter());
});

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseCors("AllowConnections");

app.UseHttpsRedirection();

app.MapControllers();

using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetService<AppDbContext>();
    if (db == null) throw new NullReferenceException("Could not connect to the Database");
    await db.Database.MigrateAsync();
}

app.Run();