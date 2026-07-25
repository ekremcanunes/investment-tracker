using System.Text.Json;
using market_service.Models;

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

    public async Task<List<SymbolSearchResult>> GetBistStocksAsync()
    {
        try
        {
            var url = $"https://api.twelvedata.com/stocks?exchange=BIST&apikey={_apiKey}";
            var response = await httpClient.GetAsync(url);
            response.EnsureSuccessStatusCode();

            var json = await response.Content.ReadAsStringAsync();
            using var doc = JsonDocument.Parse(json);

            if (!doc.RootElement.TryGetProperty("data", out var data) || data.ValueKind != JsonValueKind.Array)
                return [];

            var results = new List<SymbolSearchResult>();
            foreach (var item in data.EnumerateArray())
            {
                results.Add(new SymbolSearchResult
                {
                    Symbol = item.GetProperty("symbol").GetString() ?? string.Empty,
                    Name = item.GetProperty("name").GetString() ?? string.Empty,
                    Exchange = "BIST",
                    Currency = item.TryGetProperty("currency", out var c) ? c.GetString() ?? "TRY" : "TRY"
                });
            }
            return results;
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Failed to fetch BIST stocks from Twelve Data");
            return [];
        }
    }

    public async Task<List<SymbolSearchResult>> SearchSymbolsAsync(string query)
    {
        try
        {
            var url = $"https://api.twelvedata.com/symbol_search?symbol={Uri.EscapeDataString(query)}&apikey={_apiKey}";
            var response = await httpClient.GetAsync(url);
            response.EnsureSuccessStatusCode();

            var json = await response.Content.ReadAsStringAsync();
            using var doc = JsonDocument.Parse(json);

            if (!doc.RootElement.TryGetProperty("data", out var data) || data.ValueKind != JsonValueKind.Array)
                return [];

            var results = new List<SymbolSearchResult>();
            foreach (var item in data.EnumerateArray())
            {
                results.Add(new SymbolSearchResult
                {
                    Symbol = item.TryGetProperty("symbol", out var s) ? s.GetString() ?? string.Empty : string.Empty,
                    Name = item.TryGetProperty("instrument_name", out var n) ? n.GetString() ?? string.Empty : string.Empty,
                    Exchange = item.TryGetProperty("exchange", out var e) ? e.GetString() ?? string.Empty : string.Empty,
                    Currency = item.TryGetProperty("currency", out var c) ? c.GetString() ?? string.Empty : string.Empty
                });
            }
            return results;
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Failed to search symbols for {Query}", query);
            return [];
        }
    }
}
