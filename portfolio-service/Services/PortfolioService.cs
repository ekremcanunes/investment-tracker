using Microsoft.EntityFrameworkCore;
using portfolio_service.Data;
using portfolio_service.DTOs;
using portfolio_service.Models;

namespace portfolio_service.Services;

public class PortfolioService(AppDbContext db, IMarketServiceClient marketClient) : IPortfolioService
{
    public async Task<List<PortfolioDto>> GetAllAsync(string userId)
    {
        return await db.Portfolios
            .Where(p => p.UserId == userId)
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

    public async Task<PortfolioDto?> GetByIdAsync(Guid id, string userId)
    {
        return await db.Portfolios
            .Where(p => p.Id == id && p.UserId == userId)
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

    public async Task<PortfolioDto> CreateAsync(CreatePortfolioDto dto, string userId)
    {
        var portfolio = new Portfolio
        {
            Id = Guid.NewGuid(),
            Name = dto.Name,
            Description = dto.Description,
            CreatedAt = DateTime.UtcNow,
            UserId = userId
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

    public async Task<bool> DeleteAsync(Guid id, string userId)
    {
        var portfolio = await db.Portfolios.FirstOrDefaultAsync(p => p.Id == id && p.UserId == userId);
        if (portfolio is null) return false;

        db.Portfolios.Remove(portfolio);
        await db.SaveChangesAsync();
        return true;
    }

    public async Task<List<AssetDto>> GetAssetsAsync(Guid portfolioId, string userId)
    {
        var portfolio = await db.Portfolios.FirstOrDefaultAsync(p => p.Id == portfolioId && p.UserId == userId);
        if (portfolio is null) return [];

        return await db.Assets
            .Where(a => a.PortfolioId == portfolioId)
            .Select(a => new AssetDto
            {
                Id = a.Id,
                Symbol = a.Symbol,
                AssetType = a.AssetType,
                Quantity = a.Quantity,
                AvgCostBasis = a.AvgCostBasis,
                CreatedAt = a.CreatedAt
            })
            .ToListAsync();
    }

    public async Task<AssetDto> AddAssetAsync(Guid portfolioId, CreateAssetDto dto, string userId)
    {
        var portfolio = await db.Portfolios.FirstOrDefaultAsync(p => p.Id == portfolioId && p.UserId == userId);
        if (portfolio is null) throw new UnauthorizedAccessException();

        var asset = new Asset
        {
            Id = Guid.NewGuid(),
            PortfolioId = portfolioId,
            Symbol = dto.Symbol,
            AssetType = dto.AssetType,
            Quantity = dto.Quantity,
            AvgCostBasis = dto.PurchasePrice,
            CreatedAt = DateTime.UtcNow
        };

        db.Assets.Add(asset);

        var transaction = new Transaction
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            Type = TransactionType.AssetBuy,
            Amount = dto.Quantity,
            Currency = "TRY",
            Category = dto.AssetType.ToString(),
            Description = $"{dto.Symbol} x {dto.Quantity}",
            Date = DateTime.UtcNow,
            AssetId = asset.Id
        };
        db.Transactions.Add(transaction);

        await db.SaveChangesAsync();

        return new AssetDto
        {
            Id = asset.Id,
            Symbol = asset.Symbol,
            AssetType = asset.AssetType,
            Quantity = asset.Quantity,
            AvgCostBasis = asset.AvgCostBasis,
            CreatedAt = asset.CreatedAt
        };
    }

    public async Task<AssetDto?> UpdateAssetAsync(Guid portfolioId, Guid assetId, UpdateAssetDto dto, string userId)
    {
        var portfolio = await db.Portfolios.FirstOrDefaultAsync(p => p.Id == portfolioId && p.UserId == userId);
        if (portfolio is null) return null;

        var asset = await db.Assets.FirstOrDefaultAsync(a => a.Id == assetId && a.PortfolioId == portfolioId);
        if (asset is null) return null;

        if (dto.Quantity.HasValue) asset.Quantity = dto.Quantity.Value;
        if (dto.PurchasePrice.HasValue) asset.AvgCostBasis = dto.PurchasePrice.Value;

        await db.SaveChangesAsync();

        return new AssetDto
        {
            Id = asset.Id,
            Symbol = asset.Symbol,
            AssetType = asset.AssetType,
            Quantity = asset.Quantity,
            AvgCostBasis = asset.AvgCostBasis,
            CreatedAt = asset.CreatedAt
        };
    }

    public async Task<bool> DeleteAssetAsync(Guid portfolioId, Guid assetId, string userId)
    {
        var portfolio = await db.Portfolios.FirstOrDefaultAsync(p => p.Id == portfolioId && p.UserId == userId);
        if (portfolio is null) return false;

        var asset = await db.Assets.FirstOrDefaultAsync(a => a.Id == assetId && a.PortfolioId == portfolioId);
        if (asset is null) return false;

        db.Assets.Remove(asset);
        await db.SaveChangesAsync();
        return true;
    }

    public async Task<PortfolioSummaryDto?> GetSummaryAsync(Guid portfolioId, string userId)
    {
        var portfolio = await db.Portfolios
            .Include(p => p.Assets)
            .FirstOrDefaultAsync(p => p.Id == portfolioId && p.UserId == userId);

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
            var valueInTry = a.Quantity * priceInTry;
            var costInTry = a.AvgCostBasis.HasValue ? a.Quantity * a.AvgCostBasis.Value : (decimal?)null;
            var pl = costInTry.HasValue ? valueInTry - costInTry.Value : (decimal?)null;
            var plPercent = costInTry is > 0 ? (pl!.Value / costInTry.Value) * 100 : (decimal?)null;

            return new AssetValueDto
            {
                Id = a.Id,
                Symbol = a.Symbol,
                AssetType = a.AssetType,
                Quantity = a.Quantity,
                AvgCostBasis = a.AvgCostBasis,
                PriceInUsd = marketPrice?.PriceInUsd,
                PriceInTry = priceInTry,
                ValueInTry = valueInTry,
                CostInTry = costInTry,
                ProfitLossInTry = pl,
                ProfitLossPercent = plPercent
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

    public async Task<DashboardDto> GetDashboardAsync(string userId)
    {
        var portfolios = await db.Portfolios
            .Where(p => p.UserId == userId)
            .Include(p => p.Assets)
            .ToListAsync();

        var allAssets = portfolios.SelectMany(p => p.Assets).ToList();
        var symbols = allAssets.Select(a => a.Symbol).Distinct();

        decimal totalValue = 0;
        decimal cashValue = 0, stockValue = 0, cryptoValue = 0;
        if (allAssets.Count > 0)
        {
            var prices = await marketClient.GetPricesAsync(symbols);
            var priceMap = prices.ToDictionary(p => p.Symbol, p => p.PriceInTry);
            foreach (var a in allAssets)
            {
                var val = a.Quantity * priceMap.GetValueOrDefault(a.Symbol, 0m);
                totalValue += val;
                switch (a.AssetType)
                {
                    case Models.AssetType.Currency: cashValue += val; break;
                    case Models.AssetType.Stock: stockValue += val; break;
                    case Models.AssetType.Crypto: cryptoValue += val; break;
                }
            }
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
            CashValueInTry = cashValue,
            StockValueInTry = stockValue,
            CryptoValueInTry = cryptoValue,
            RecentAssets = recentAssets
        };
    }
}
