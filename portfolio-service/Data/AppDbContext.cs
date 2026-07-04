using Microsoft.EntityFrameworkCore;
using portfolio_service.Models;

namespace portfolio_service.Data;

public class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options)
{
    public DbSet<Portfolio> Portfolios => Set<Portfolio>();
    public DbSet<Asset> Assets => Set<Asset>();
    public DbSet<Transaction> Transactions => Set<Transaction>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Asset>(entity =>
        {
            entity.Property(a => a.Quantity).HasPrecision(18, 8);
            entity.Property(a => a.AvgCostBasis).HasPrecision(18, 8);
            entity.Property(a => a.AssetType).HasConversion<string>();
            entity.HasMany(a => a.Transactions)
                .WithOne(t => t.Asset)
                .HasForeignKey(t => t.AssetId)
                .OnDelete(DeleteBehavior.SetNull);
        });

        modelBuilder.Entity<Portfolio>()
            .HasMany(p => p.Assets)
            .WithOne(a => a.Portfolio)
            .HasForeignKey(a => a.PortfolioId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<Transaction>(entity =>
        {
            entity.Property(t => t.Amount).HasPrecision(18, 2);
            entity.Property(t => t.InstallmentMonthlyAmount).HasPrecision(18, 2);
            entity.Property(t => t.Type).HasConversion<string>();
            entity.HasIndex(t => t.UserId);
            entity.HasIndex(t => t.Date);
            entity.HasIndex(t => t.Type);
        });
    }
}
