namespace portfolio_service.Services;

public interface IMarketServiceClient
{
    Task<List<MarketPriceResponse>> GetPricesAsync(IEnumerable<string> symbols);
    Task<List<SymbolSearchResponse>> SearchAsync(string query);
}

public class SymbolSearchResponse
{
    public string Symbol { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string Exchange { get; set; } = string.Empty;
    public string Currency { get; set; } = string.Empty;
}

public class MarketPriceResponse
{
    public string Symbol { get; set; } = string.Empty;
    public string AssetType { get; set; } = string.Empty;
    public decimal? PriceInUsd { get; set; }
    public decimal PriceInTry { get; set; }
    public DateTime UpdatedAt { get; set; }
}
