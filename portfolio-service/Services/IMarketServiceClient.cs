namespace portfolio_service.Services;

public interface IMarketServiceClient
{
    Task<List<MarketPriceResponse>> GetPricesAsync(IEnumerable<string> symbols);
}

public class MarketPriceResponse
{
    public string Symbol { get; set; } = string.Empty;
    public string AssetType { get; set; } = string.Empty;
    public decimal PriceInTry { get; set; }
    public DateTime UpdatedAt { get; set; }
}
