namespace market_service.Services;

public interface ITwelveDataClient
{
    Task<decimal?> GetStockPriceAsync(string symbol, string? exchange = null);
    Task<decimal?> GetCryptoPriceAsync(string symbol);
}
