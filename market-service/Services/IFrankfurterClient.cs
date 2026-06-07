namespace market_service.Services;

public interface IFrankfurterClient
{
    Task<decimal?> GetExchangeRateAsync(string baseCurrency);
}
