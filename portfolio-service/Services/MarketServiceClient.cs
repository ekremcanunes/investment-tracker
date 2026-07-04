using System.Net.Http.Json;

namespace portfolio_service.Services;

public class MarketServiceClient(HttpClient httpClient, IHttpContextAccessor httpContextAccessor) : IMarketServiceClient
{
    public async Task<List<MarketPriceResponse>> GetPricesAsync(IEnumerable<string> symbols)
    {
        var symbolList = string.Join(",", symbols);
        var request = new HttpRequestMessage(HttpMethod.Get, $"/api/market/prices?symbols={symbolList}");

        var cookieHeader = httpContextAccessor.HttpContext?.Request.Headers["Cookie"].ToString();
        if (!string.IsNullOrEmpty(cookieHeader))
            request.Headers.Add("Cookie", cookieHeader);

        var response = await httpClient.SendAsync(request);
        response.EnsureSuccessStatusCode();
        var result = await response.Content.ReadFromJsonAsync<List<MarketPriceResponse>>();
        return result ?? new List<MarketPriceResponse>();
    }
}
