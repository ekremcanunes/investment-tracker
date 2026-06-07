using System.Net.Http.Json;

namespace portfolio_service.Services;

public class MarketServiceClient(HttpClient httpClient) : IMarketServiceClient
{
    public async Task<List<MarketPriceResponse>> GetPricesAsync(IEnumerable<string> symbols)
    {
        var symbolList = string.Join(",", symbols);
        var response = await httpClient.GetAsync($"/api/market/prices?symbols={symbolList}");
        response.EnsureSuccessStatusCode();
        var result = await response.Content.ReadFromJsonAsync<List<MarketPriceResponse>>();
        return result ?? new List<MarketPriceResponse>();
    }
}
