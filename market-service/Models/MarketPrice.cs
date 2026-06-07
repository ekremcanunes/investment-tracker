namespace market_service.Models;

public class MarketPrice
{
    public string Symbol { get; set; } = string.Empty;
    public string AssetType { get; set; } = string.Empty;
    public decimal? PriceInUsd { get; set; }
    public decimal PriceInTry { get; set; }
    public DateTime UpdatedAt { get; set; }
}
