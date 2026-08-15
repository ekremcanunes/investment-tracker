namespace portfolio_service.Services;

public interface IMarketServiceClient
{
    Task<List<MarketPriceResponse>> GetPricesAsync(IEnumerable<string> symbols);
    Task<List<SymbolSearchResponse>> SearchAsync(string query);
    Task<MarketOverviewResponse> GetOverviewAsync();
}

public class MarketQuoteResponse
{
    public string Symbol { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public decimal Price { get; set; }
    public decimal? PreviousClose { get; set; }
    public decimal? ChangePercent { get; set; }
}

public class MarketOverviewResponse
{
    public List<MarketQuoteResponse> Indices { get; set; } = new();
    public List<MarketQuoteResponse> Strip { get; set; } = new();
    public List<MarketQuoteResponse> Stocks { get; set; } = new();
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

    // Detay kartı için native (işlem para birimi) veriler
    public string NativeCurrency { get; set; } = string.Empty;
    public decimal? PreviousClose { get; set; }
    public decimal? DayHigh { get; set; }
    public decimal? DayLow { get; set; }
    public decimal? Week52High { get; set; }
    public decimal? Week52Low { get; set; }
    public long? Volume { get; set; }
    public string Exchange { get; set; } = string.Empty;
}
