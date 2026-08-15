namespace market_service.Models;

// Piyasa panosu için tek satır (hisse/endeks/döviz/altın). Price gösterilen değer:
// hisse/altın/döviz için TL, endeks için puan.
public class MarketQuote
{
    public string Symbol { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public decimal Price { get; set; }
    public decimal? PreviousClose { get; set; }
    public decimal? ChangePercent { get; set; }
}

public class MarketOverview
{
    public List<MarketQuote> Indices { get; set; } = [];  // BIST100, BIST30
    public List<MarketQuote> Strip { get; set; } = [];    // USD, EUR, Altın (gram TL)
    public List<MarketQuote> Stocks { get; set; } = [];   // BIST 30 hisseleri
}
