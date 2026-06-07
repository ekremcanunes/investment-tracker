namespace market_service.Services;

public interface IAlphaVantageClient
{
    Task<decimal?> GetStockPriceAsync(string symbol);
    Task<decimal?> GetCryptoPriceAsync(string symbol);
}
