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
            // /quote fiyatın yanında para birimini de döndürür (BIST=TRY, US=USD) — çeviriyi buna göre yaparız
            var url = $"https://api.twelvedata.com/quote?symbol={Uri.EscapeDataString(symbol)}&apikey={_apiKey}";
            if (!string.IsNullOrEmpty(exchange))
                url += $"&exchange={Uri.EscapeDataString(exchange)}";

            var response = await httpClient.GetAsync(url);
            response.EnsureSuccessStatusCode();

            var json = await response.Content.ReadAsStringAsync();
            using var doc = JsonDocument.Parse(json);
            var root = doc.RootElement;

            if (!root.TryGetProperty("close", out var closeEl) ||
                !root.TryGetProperty("currency", out var currencyEl))
            {
                logger.LogWarning("No quote returned from Twelve Data for {Symbol}", symbol);
                return null;
            }

            var price = decimal.Parse(closeEl.GetString()!, System.Globalization.CultureInfo.InvariantCulture);
            var currency = currencyEl.GetString()!;

            var usdTryRate = await frankfurterClient.GetExchangeRateAsync("USD");
            if (usdTryRate == null) return null;

            if (currency.Equals("TRY", StringComparison.OrdinalIgnoreCase))
                return new TwelveDataPrice(price / usdTryRate.Value, price);

            if (currency.Equals("USD", StringComparison.OrdinalIgnoreCase))
                return new TwelveDataPrice(price, price * usdTryRate.Value);

            // Diğer para birimleri (EUR, GBP...) → önce TRY'ye, oradan USD'ye
            var currencyTryRate = await frankfurterClient.GetExchangeRateAsync(currency);
            if (currencyTryRate == null) return null;
            var priceInTry = price * currencyTryRate.Value;
            return new TwelveDataPrice(priceInTry / usdTryRate.Value, priceInTry);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Failed to get stock price for {Symbol}", symbol);
            return null;
        }
    }
}
