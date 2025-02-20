using HackerRankFeedApi.Entities;
using Microsoft.EntityFrameworkCore;

namespace HackerRankFeedApi.Infrastructure;

public class HnDbContext : DbContext
{
    public HnDbContext(DbContextOptions<HnDbContext> options) : base(options)
    {
    }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<HnStory>()
            .Property(c => c.Id)
            .ValueGeneratedNever();
        modelBuilder.Entity<HnStory>()
            .HasKey(c => c.Id);
    }

    public DbSet<HnStory> Stories { get; set; }
}