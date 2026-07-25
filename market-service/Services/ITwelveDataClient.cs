namespace market_service.Services;

public record TwelveDataPrice(decimal PriceInUsd, decimal PriceInTry);

public interface ITwelveDataClient
{
    Task<TwelveDataPrice?> GetStockPriceAsync(string symbol, string? exchange = null);
}
