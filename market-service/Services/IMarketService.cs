using market_service.Models;

namespace market_service.Services;

public interface IMarketService
{
    Task<MarketPrice?> GetPriceAsync(string symbol);
    Task<List<MarketPrice>> GetPricesAsync(IEnumerable<string> symbols);
}
