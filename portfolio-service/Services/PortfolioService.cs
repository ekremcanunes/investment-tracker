using Microsoft.EntityFrameworkCore;
using portfolio_service.Data;
using portfolio_service.DTOs;
using portfolio_service.Models;

namespace portfolio_service.Services;

public class PortfolioService(AppDbContext db, IMarketServiceClient marketClient) : IPortfolioService
{
    public async Task<List<PortfolioDto>> GetAllAsync()
    {
        return await db.Portfolios
            .Select(p => new PortfolioDto
            {
                Id = p.Id,
                Name = p.Name,
                Description = p.Description,
                CreatedAt = p.CreatedAt,
                AssetCount = p.Assets.Count
            })
            .ToListAsync();
    }

    public async Task<PortfolioDto?> GetByIdAsync(Guid id)
    {
        return await db.Portfolios
            .Where(p => p.Id == id)
            .Select(p => new PortfolioDto
            {
                Id = p.Id,
                Name = p.Name,
                Description = p.Description,
                CreatedAt = p.CreatedAt,
                AssetCount = p.Assets.Count
            })
            .FirstOrDefaultAsync();
    }

    public async Task<PortfolioDto> CreateAsync(CreatePortfolioDto dto)
    {
        var portfolio = new Portfolio
        {
            Id = Guid.NewGuid(),
            Name = dto.Name,
            Description = dto.Description,
            CreatedAt = DateTime.UtcNow
        };

        db.Portfolios.Add(portfolio);
        await db.SaveChangesAsync();

        return new PortfolioDto
        {
            Id = portfolio.Id,
            Name = portfolio.Name,
            Description = portfolio.Description,
            CreatedAt = portfolio.CreatedAt,
            AssetCount = 0
        };
    }

    public async Task<bool> DeleteAsync(Guid id)
    {
        var portfolio = await db.Portfolios.FindAsync(id);
        if (portfolio is null) return false;

        db.Portfolios.Remove(portfolio);
        await db.SaveChangesAsync();
        return true;
    }

    public async Task<List<AssetDto>> GetAssetsAsync(Guid portfolioId)
    {
        return await db.Assets
            .Where(a => a.PortfolioId == portfolioId)
            .Select(a => new AssetDto
            {
                Id = a.Id,
                Symbol = a.Symbol,
                AssetType = a.AssetType,
                Quantity = a.Quantity,
                CreatedAt = a.CreatedAt
            })
            .ToListAsync();
    }

    public async Task<AssetDto> AddAssetAsync(Guid portfolioId, CreateAssetDto dto)
    {
        var asset = new Asset
        {
            Id = Guid.NewGuid(),
            PortfolioId = portfolioId,
            Symbol = dto.Symbol,
            AssetType = dto.AssetType,
            Quantity = dto.Quantity,
            CreatedAt = DateTime.UtcNow
        };

        db.Assets.Add(asset);
        await db.SaveChangesAsync();

        return new AssetDto
        {
            Id = asset.Id,
            Symbol = asset.Symbol,
            AssetType = asset.AssetType,
            Quantity = asset.Quantity,
            CreatedAt = asset.CreatedAt
        };
    }

    public async Task<bool> DeleteAssetAsync(Guid portfolioId, Guid assetId)
    {
        var asset = await db.Assets.FirstOrDefaultAsync(a => a.Id == assetId && a.PortfolioId == portfolioId);
        if (asset is null) return false;

        db.Assets.Remove(asset);
        await db.SaveChangesAsync();
        return true;
    }

    public async Task<PortfolioSummaryDto?> GetSummaryAsync(Guid portfolioId)
    {
        var portfolio = await db.Portfolios
            .Include(p => p.Assets)
            .FirstOrDefaultAsync(p => p.Id == portfolioId);

        if (portfolio is null) return null;

        var symbols = portfolio.Assets.Select(a => a.Symbol).Distinct().ToList();
        var prices = symbols.Count > 0
            ? await marketClient.GetPricesAsync(symbols)
            : new List<MarketPriceResponse>();
        var priceMap = prices.ToDictionary(p => p.Symbol, p => p);

        var assetValues = portfolio.Assets.Select(a =>
        {
            var marketPrice = priceMap.GetValueOrDefault(a.Symbol);
            var priceInTry = marketPrice?.PriceInTry ?? 0m;
            return new AssetValueDto
            {
                Id = a.Id,
                Symbol = a.Symbol,
                AssetType = a.AssetType,
                Quantity = a.Quantity,
                PriceInUsd = marketPrice?.PriceInUsd,
                PriceInTry = priceInTry,
                ValueInTry = a.Quantity * priceInTry
            };
        }).ToList();

        return new PortfolioSummaryDto
        {
            Id = portfolio.Id,
            Name = portfolio.Name,
            Description = portfolio.Description,
            TotalValueInTry = assetValues.Sum(a => a.ValueInTry),
            Assets = assetValues
        };
    }

    public async Task<DashboardDto> GetDashboardAsync()
    {
        var portfolios = await db.Portfolios.Include(p => p.Assets).ToListAsync();

        var allAssets = portfolios.SelectMany(p => p.Assets).ToList();
        var symbols = allAssets.Select(a => a.Symbol).Distinct();

        decimal totalValue = 0;
        if (allAssets.Count > 0)
        {
            var prices = await marketClient.GetPricesAsync(symbols);
            var priceMap = prices.ToDictionary(p => p.Symbol, p => p.PriceInTry);
            totalValue = allAssets.Sum(a => a.Quantity * priceMap.GetValueOrDefault(a.Symbol, 0m));
        }

        var recentAssets = allAssets
            .OrderByDescending(a => a.CreatedAt)
            .Take(5)
            .Select(a => new AssetDto
            {
                Id = a.Id,
                Symbol = a.Symbol,
                AssetType = a.AssetType,
                Quantity = a.Quantity,
                PortfolioName = a.Portfolio?.Name ?? string.Empty,
                CreatedAt = a.CreatedAt
            })
            .ToList();

        return new DashboardDto
        {
            TotalValueInTry = totalValue,
            PortfolioCount = portfolios.Count,
            AssetCount = allAssets.Count,
            RecentAssets = recentAssets
        };
    }
}
