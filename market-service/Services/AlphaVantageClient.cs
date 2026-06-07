using System.Text.Json;

namespace market_service.Services;

public class AlphaVantageClient : IAlphaVantageClient
{
    private readonly HttpClient _httpClient;
    private readonly IFrankfurterClient _frankfurterClient;
    private readonly ILogger<AlphaVantageClient> _logger;
    private readonly string _apiKey;

    private static readonly Dictionary<string, decimal> MockStockPricesUsd = new()
    {
        { "AAPL", 250m },
        { "MSFT", 450m },
        { "NVDA", 130m },
        { "GOOGL", 180m }
    };

    private static readonly Dictionary<string, decimal> MockCryptoPricesUsd = new()
    {
        { "BTC", 100000m },
        { "ETH", 3800m },
        { "SOL", 180m }
    };

    public AlphaVantageClient(HttpClient httpClient, IFrankfurterClient frankfurterClient,
        IConfiguration configuration, ILogger<AlphaVantageClient> logger)
    {
        _httpClient = httpClient;
        _frankfurterClient = frankfurterClient;
        _logger = logger;
        _apiKey = configuration["AlphaVantage:ApiKey"] ?? string.Empty;
    }

    public async Task<decimal?> GetStockPriceAsync(string symbol)
    {
        if (string.IsNullOrEmpty(_apiKey))
        {
            return await GetMockStockPriceInTryAsync(symbol);
        }

        try
        {
            var url = $"https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol={symbol}&apikey={_apiKey}";
            var response = await _httpClient.GetAsync(url);
            response.EnsureSuccessStatusCode();

            var json = await response.Content.ReadAsStringAsync();
            using var doc = JsonDocument.Parse(json);

            if (doc.RootElement.TryGetProperty("Global Quote", out var quote) &&
                quote.TryGetProperty("05. price", out var price))
            {
                var usdPrice = decimal.Parse(price.GetString()!, System.Globalization.CultureInfo.InvariantCulture);
                var usdTryRate = await _frankfurterClient.GetExchangeRateAsync("USD");
                if (usdTryRate == null) return null;
                return usdPrice * usdTryRate.Value;
            }

            return null;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to get stock price for {Symbol}", symbol);
            return null;
        }
    }

    public async Task<decimal?> GetCryptoPriceAsync(string symbol)
    {
        if (string.IsNullOrEmpty(_apiKey))
        {
            return await GetMockCryptoPriceInTryAsync(symbol);
        }

        try
        {
            var url = $"https://www.alphavantage.co/query?function=CURRENCY_EXCHANGE_RATE&from_currency={symbol}&to_currency=TRY&apikey={_apiKey}";
            var response = await _httpClient.GetAsync(url);
            response.EnsureSuccessStatusCode();

            var json = await response.Content.ReadAsStringAsync();
            using var doc = JsonDocument.Parse(json);

            if (doc.RootElement.TryGetProperty("Realtime Currency Exchange Rate", out var rate) &&
                rate.TryGetProperty("5. Exchange Rate", out var exchangeRate))
            {
                return decimal.Parse(exchangeRate.GetString()!, System.Globalization.CultureInfo.InvariantCulture);
            }

            return null;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to get crypto price for {Symbol}", symbol);
            return null;
        }
    }

    private async Task<decimal?> GetMockStockPriceInTryAsync(string symbol)
    {
        if (!MockStockPricesUsd.TryGetValue(symbol, out var usdPrice)) return null;
        var usdTryRate = await _frankfurterClient.GetExchangeRateAsync("USD");
        if (usdTryRate == null) return null;
        return usdPrice * usdTryRate.Value;
    }

    private async Task<decimal?> GetMockCryptoPriceInTryAsync(string symbol)
    {
        if (!MockCryptoPricesUsd.TryGetValue(symbol, out var usdPrice)) return null;
        var usdTryRate = await _frankfurterClient.GetExchangeRateAsync("USD");
        if (usdTryRate == null) return null;
        return usdPrice * usdTryRate.Value;
    }
}
