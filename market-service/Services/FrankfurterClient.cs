using System.Text.Json;

namespace market_service.Services;

public class FrankfurterClient : IFrankfurterClient
{
    private readonly HttpClient _httpClient;
    private readonly ILogger<FrankfurterClient> _logger;

    public FrankfurterClient(HttpClient httpClient, ILogger<FrankfurterClient> logger)
    {
        _httpClient = httpClient;
        _logger = logger;
    }

    public async Task<decimal?> GetExchangeRateAsync(string baseCurrency)
    {
        try
        {
            var response = await _httpClient.GetAsync($"https://api.frankfurter.dev/v2/rates?base={baseCurrency}&quotes=TRY");
            response.EnsureSuccessStatusCode();

            var json = await response.Content.ReadAsStringAsync();
            using var doc = JsonDocument.Parse(json);

            if (doc.RootElement.ValueKind == JsonValueKind.Array &&
                doc.RootElement.GetArrayLength() > 0)
            {
                var first = doc.RootElement[0];
                if (first.TryGetProperty("rate", out var rate))
                    return rate.GetDecimal();
            }

            return null;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to get exchange rate for {BaseCurrency}", baseCurrency);
            return null;
        }
    }
}
