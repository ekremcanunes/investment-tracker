using System.Text.Json;
using market_service.Models;
using Microsoft.Extensions.Caching.Distributed;

namespace market_service.Services;

public class MarketService : IMarketService
{
    private static readonly HashSet<string> CurrencySymbols = new(StringComparer.OrdinalIgnoreCase) { "USD", "EUR", "GBP" };
    private static readonly HashSet<string> StockSymbols = new(StringComparer.OrdinalIgnoreCase) { "AAPL", "MSFT", "NVDA", "GOOGL" };

    private readonly IDistributedCache _cache;
    private readonly IFrankfurterClient _frankfurterClient;
    private readonly ITwelveDataClient _twelveDataClient;
    private readonly ILogger<MarketService> _logger;
    private readonly int _ttlMinutes;

    public MarketService(IDistributedCache cache, IFrankfurterClient frankfurterClient,
        ITwelveDataClient twelveDataClient, IConfiguration configuration, ILogger<MarketService> logger)
    {
        _cache = cache;
        _frankfurterClient = frankfurterClient;
        _twelveDataClient = twelveDataClient;
        _logger = logger;
        _ttlMinutes = configuration.GetValue<int>("Cache:TtlMinutes", 5);
    }

    public async Task<MarketPrice?> GetPriceAsync(string symbol)
    {
        symbol = symbol.ToUpperInvariant();
        var assetType = ResolveAssetType(symbol);
        if (assetType == null)
        {
            _logger.LogWarning("Unknown symbol: {Symbol}", symbol);
            return null;
        }

        var cacheKey = $"{assetType.ToLower()}:{symbol}";
        var cached = await _cache.GetStringAsync(cacheKey);
        if (cached != null)
        {
            return JsonSerializer.Deserialize<MarketPrice>(cached);
        }

        var (priceInUsd, priceInTry) = await FetchPriceAsync(symbol, assetType);
        if (priceInTry == null) return null;

        var marketPrice = new MarketPrice
        {
            Symbol = symbol,
            AssetType = assetType,
            PriceInUsd = priceInUsd,
            PriceInTry = priceInTry.Value,
            UpdatedAt = DateTime.UtcNow
        };

        var options = new DistributedCacheEntryOptions
        {
            AbsoluteExpirationRelativeToNow = TimeSpan.FromMinutes(_ttlMinutes)
        };

        await _cache.SetStringAsync(cacheKey, JsonSerializer.Serialize(marketPrice), options);

        return marketPrice;
    }

    public async Task<List<MarketPrice>> GetPricesAsync(IEnumerable<string> symbols)
    {
        var tasks = symbols.Select(GetPriceAsync);
        var results = await Task.WhenAll(tasks);
        return results.Where(r => r != null).Select(r => r!).ToList();
    }

    private string? ResolveAssetType(string symbol)
    {
        if (CurrencySymbols.Contains(symbol)) return "Currency";
        if (StockSymbols.Contains(symbol)) return "Stock";
        return null;
    }

    private async Task<(decimal? priceInUsd, decimal? priceInTry)> FetchPriceAsync(string symbol, string assetType)
    {
        if (assetType == "Currency")
        {
            var tryRate = await _frankfurterClient.GetExchangeRateAsync(symbol);
            return (null, tryRate);
        }

        var result = assetType switch
        {
            "Stock" => await _twelveDataClient.GetStockPriceAsync(symbol),
            _ => null
        };

        return result == null ? (null, null) : (result.PriceInUsd, result.PriceInTry);
    }
}
