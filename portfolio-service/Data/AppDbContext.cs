using Microsoft.EntityFrameworkCore;
using portfolio_service.Models;

namespace portfolio_service.Data;

public class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options)
{
    public DbSet<Portfolio> Portfolios => Set<Portfolio>();
    public DbSet<Asset> Assets => Set<Asset>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Asset>(entity =>
        {
            entity.Property(a => a.Quantity).HasPrecision(18, 8);
            entity.Property(a => a.AssetType).HasConversion<string>();
        });

        modelBuilder.Entity<Portfolio>()
            .HasMany(p => p.Assets)
            .WithOne(a => a.Portfolio)
            .HasForeignKey(a => a.PortfolioId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
