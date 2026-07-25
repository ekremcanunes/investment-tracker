using System.Text.Json;

namespace market_service.Services;

public class TwelveDataClient(HttpClient httpClient, IFrankfurterClient frankfurterClient,
    IConfiguration configuration, ILogger<TwelveDataClient> logger) : ITwelveDataClient
{
    private readonly string _apiKey = configuration["TwelveData:ApiKey"] ?? string.Empty;

    public async Task<TwelveDataPrice?> GetStockPriceAsync(string symbol, string? exchange = null)
    {
        try
        {
            var url = $"https://api.twelvedata.com/price?symbol={symbol}&apikey={_apiKey}";
            if (!string.IsNullOrEmpty(exchange))
                url += $"&exchange={exchange}";

            var response = await httpClient.GetAsync(url);
            response.EnsureSuccessStatusCode();

            var json = await response.Content.ReadAsStringAsync();
            using var doc = JsonDocument.Parse(json);

            if (doc.RootElement.TryGetProperty("price", out var price))
            {
                var usdPrice = decimal.Parse(price.GetString()!, System.Globalization.CultureInfo.InvariantCulture);
                var usdTryRate = await frankfurterClient.GetExchangeRateAsync("USD");
                if (usdTryRate == null) return null;
                return new TwelveDataPrice(usdPrice, usdPrice * usdTryRate.Value);
            }

            logger.LogWarning("No price returned from Twelve Data for {Symbol}", symbol);
            return null;
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Failed to get stock price for {Symbol}", symbol);
            return null;
        }
    }
}
