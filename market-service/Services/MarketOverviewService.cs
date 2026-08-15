using System.Text.Json;
using market_service.Models;
using Microsoft.Extensions.Caching.Distributed;

namespace market_service.Services;

public interface IMarketOverviewService
{
    Task<MarketOverview> GetOverviewAsync();
}

public class MarketOverviewService : IMarketOverviewService
{
    private const string CacheKey = "market:overview";
    private const int CacheMinutes = 10;
    private const decimal GramsPerOunce = 31.1034768m;

    // BIST 30 bileşenleri — endeks üyeliğini API vermediği için elle tutulur.
    // Periyodik olarak (BIST 30 üç ayda bir gözden geçirilir) güncellenmeli.
    private static readonly string[] Bist30 =
    [
        "AKBNK", "ARCLK", "ASELS", "ASTOR", "BIMAS", "BRSAN", "EKGYO", "ENKAI", "EREGL", "FROTO",
        "GARAN", "GUBRF", "HEKTS", "ISCTR", "KCHOL", "KONTR", "AEFES", "KRDMD", "OYAKC", "PETKM",
        "PGSUS", "SAHOL", "SASA", "SISE", "TCELL", "THYAO", "TOASO", "TTKOM", "TUPRS", "YKBNK"
    ];

    private readonly IYahooFinanceClient _yahoo;
    private readonly IFrankfurterClient _frankfurter;
    private readonly IBistCatalog _bistCatalog;
    private readonly IDistributedCache _cache;
    private readonly ILogger<MarketOverviewService> _logger;

    public MarketOverviewService(IYahooFinanceClient yahoo, IFrankfurterClient frankfurter,
        IBistCatalog bistCatalog, IDistributedCache cache, ILogger<MarketOverviewService> logger)
    {
        _yahoo = yahoo;
        _frankfurter = frankfurter;
        _bistCatalog = bistCatalog;
        _cache = cache;
        _logger = logger;
    }

    public async Task<MarketOverview> GetOverviewAsync()
    {
        var cached = await _cache.GetStringAsync(CacheKey);
        if (cached != null)
            return JsonSerializer.Deserialize<MarketOverview>(cached) ?? new MarketOverview();

        var nameMap = (await _bistCatalog.GetAllAsync())
            .GroupBy(s => s.Symbol, StringComparer.OrdinalIgnoreCase)
            .ToDictionary(g => g.Key, g => g.First().Name, StringComparer.OrdinalIgnoreCase);

        var usdTryRate = await _frankfurter.GetExchangeRateAsync("USD");

        // Endeksler
        var indexTasks = new[]
        {
            YahooQuoteAsync("XU100.IS", "BIST 100"),
            YahooQuoteAsync("XU030.IS", "BIST 30"),
        };

        // BIST 30 hisseleri
        var stockTasks = Bist30.Select(t =>
            YahooQuoteAsync($"{t}.IS", nameMap.GetValueOrDefault(t, t), displaySymbol: t));

        var strip = await BuildStripAsync(usdTryRate);
        var indices = (await Task.WhenAll(indexTasks)).Where(q => q != null).Select(q => q!).ToList();
        var stocks = (await Task.WhenAll(stockTasks)).Where(q => q != null).Select(q => q!).ToList();

        var overview = new MarketOverview { Indices = indices, Strip = strip, Stocks = stocks };

        await _cache.SetStringAsync(CacheKey, JsonSerializer.Serialize(overview),
            new DistributedCacheEntryOptions { AbsoluteExpirationRelativeToNow = TimeSpan.FromMinutes(CacheMinutes) });

        return overview;
    }

    // Tek Yahoo sembolü → MarketQuote (hata olursa null → listeden düşer)
    private async Task<MarketQuote?> YahooQuoteAsync(string yahooSymbol, string name, string? displaySymbol = null)
    {
        var q = await _yahoo.GetQuoteAsync(yahooSymbol);
        if (q == null) return null;
        return new MarketQuote
        {
            Symbol = displaySymbol ?? yahooSymbol,
            Name = name,
            Price = q.Price,
            PreviousClose = q.PreviousClose,
            ChangePercent = ChangePct(q.Price, q.PreviousClose),
        };
    }

    private async Task<List<MarketQuote>> BuildStripAsync(decimal? usdTryRate)
    {
        var strip = new List<MarketQuote>();

        var usd = await _frankfurter.GetExchangeRateAsync("USD");
        if (usd.HasValue) strip.Add(new MarketQuote { Symbol = "USD", Name = "USD/TRY", Price = usd.Value });

        var eur = await _frankfurter.GetExchangeRateAsync("EUR");
        if (eur.HasValue) strip.Add(new MarketQuote { Symbol = "EUR", Name = "EUR/TRY", Price = eur.Value });

        // Altın: GC=F (USD/ons) → gram TL
        var gold = await _yahoo.GetQuoteAsync("GC=F");
        if (gold != null && usdTryRate.HasValue)
        {
            var gram = gold.Price / GramsPerOunce * usdTryRate.Value;
            decimal? prevGram = gold.PreviousClose.HasValue
                ? gold.PreviousClose.Value / GramsPerOunce * usdTryRate.Value
                : null;
            strip.Add(new MarketQuote
            {
                Symbol = "XAU",
                Name = "Gram Altın",
                Price = gram,
                PreviousClose = prevGram,
                ChangePercent = ChangePct(gram, prevGram),
            });
        }

        return strip;
    }

    private static decimal? ChangePct(decimal price, decimal? prev) =>
        prev is > 0 ? (price - prev.Value) / prev.Value * 100 : null;
}
