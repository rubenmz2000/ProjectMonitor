using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ProjectMonitor.Core.Entities;

namespace ProjectMonitor.DataAccess.Configurations;

public class ActorConfiguration : IEntityTypeConfiguration<Actor>
{
    public void Configure(EntityTypeBuilder<Actor> builder)
    {
        builder.HasKey(a => a.Id);
        builder.Property(a => a.Kind).HasConversion<string>();
        builder.Property(a => a.DisplayName).IsRequired().HasMaxLength(100);
        builder.Property(a => a.Identifier).IsRequired().HasMaxLength(50);
        builder.HasIndex(a => a.Identifier).IsUnique().HasDatabaseName("IX_Actor_Identifier");
    }
}
