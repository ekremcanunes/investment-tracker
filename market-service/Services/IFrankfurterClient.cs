namespace market_service.Services;

public interface IFrankfurterClient
{
    Task<decimal?> GetExchangeRateAsync(string baseCurrency);

    // Son N günün TRY kuru, kronolojik sırada. Sparkline ve önceki kapanış için.
    Task<List<decimal>> GetSeriesAsync(string baseCurrency, int days);
}
