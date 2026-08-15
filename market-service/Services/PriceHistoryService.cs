using System.Text.Json;
using market_service.Models;
using Microsoft.Extensions.Caching.Distributed;

namespace market_service.Services;

public interface IPriceHistoryService
{
    Task<PriceHistory> GetHistoryAsync(string symbol, string assetType, string range);
}

// Grafik için OHLC serisi. Kaynak Yahoo; sembol çözümlemesi MarketService ile aynı mantık.
public class PriceHistoryService : IPriceHistoryService
{
    private const decimal GramsPerOunce = 31.1034768m;

    // Desteklenen aralıklar → (Yahoo range, interval). Beyaz liste: dışarıdan gelen
    // değer doğrudan Yahoo'ya geçmez.
    private static readonly Dictionary<string, (string Range, string Interval)> Ranges = new(StringComparer.OrdinalIgnoreCase)
    {
        ["1d"] = ("1d", "5m"),
        ["1w"] = ("5d", "30m"),
        ["1mo"] = ("1mo", "1d"),
        ["3mo"] = ("3mo", "1d"),
        ["1y"] = ("1y", "1d"),
        ["5y"] = ("5y", "1wk"),
    };

    private readonly IYahooFinanceClient _yahoo;
    private readonly IFrankfurterClient _frankfurter;
    private readonly IBistCatalog _bistCatalog;
    private readonly IDistributedCache _cache;

    public PriceHistoryService(IYahooFinanceClient yahoo, IFrankfurterClient frankfurter,
        IBistCatalog bistCatalog, IDistributedCache cache)
    {
        _yahoo = yahoo;
        _frankfurter = frankfurter;
        _bistCatalog = bistCatalog;
        _cache = cache;
    }

    public static bool IsValidRange(string range) => Ranges.ContainsKey(range);

    public async Task<PriceHistory> GetHistoryAsync(string symbol, string assetType, string range)
    {
        if (!Ranges.TryGetValue(range, out var spec))
            return new PriceHistory { Symbol = symbol, Range = range };

        var cacheKey = $"history:{assetType}:{symbol}:{range}".ToLowerInvariant();
        var cached = await _cache.GetStringAsync(cacheKey);
        if (cached != null)
            return JsonSerializer.Deserialize<PriceHistory>(cached) ?? new PriceHistory();

        var history = assetType.Equals("Gold", StringComparison.OrdinalIgnoreCase)
            ? await GoldHistoryAsync(spec)
            : assetType.Equals("Currency", StringComparison.OrdinalIgnoreCase)
                ? await CurrencyHistoryAsync(symbol, spec)
                : await StockHistoryAsync(symbol, spec);

        history.Symbol = symbol;
        history.Range = range;

        // Gün içi seriler hızlı bayatlar, günlük seriler bayatlamaz.
        var ttl = spec.Interval.EndsWith('m') ? TimeSpan.FromMinutes(5) : TimeSpan.FromHours(1);
        await _cache.SetStringAsync(cacheKey, JsonSerializer.Serialize(history),
            new DistributedCacheEntryOptions { AbsoluteExpirationRelativeToNow = ttl });

        return history;
    }

    private async Task<PriceHistory> StockHistoryAsync(string symbol, (string Range, string Interval) spec)
    {
        var isBist = await _bistCatalog.IsBistAsync(symbol);
        var yahooSymbol = isBist ? $"{symbol}.IS" : symbol;
        var (candles, currency) = await _yahoo.GetCandlesAsync(yahooSymbol, spec.Range, spec.Interval);
        return new PriceHistory { Candles = candles, Currency = currency };
    }

    // Altın: GC=F USD/ons → gram TL. Güncel kurla çevrilir; geçmiş kur farkı yansımaz,
    // seri eğilimi gösterir (bkz. DESIGN.md §6.1).
    private async Task<PriceHistory> GoldHistoryAsync((string Range, string Interval) spec)
    {
        var (candles, _) = await _yahoo.GetCandlesAsync("GC=F", spec.Range, spec.Interval);
        var usdTry = await _frankfurter.GetExchangeRateAsync("USD");
        if (usdTry == null) return new PriceHistory();

        var factor = usdTry.Value / GramsPerOunce;
        foreach (var c in candles)
        {
            c.Open *= factor;
            c.High *= factor;
            c.Low *= factor;
            c.Close *= factor;
            c.Volume = null; // ons hacmi gram TL grafiğinde anlamsız
        }
        return new PriceHistory { Candles = candles, Currency = "TRY" };
    }

    // Döviz: Frankfurter yalnızca günlük kapanış verir → OHLC dört alan da aynı.
    // Mum değil çizgi grafiği anlamlıdır; frontend bunu Currency tipinde çizgiye çeviriyor.
    private async Task<PriceHistory> CurrencyHistoryAsync(string symbol, (string Range, string Interval) spec)
    {
        var days = spec.Range switch
        {
            "1d" => 5,
            "5d" => 10,
            "1mo" => 30,
            "3mo" => 90,
            "1y" => 365,
            _ => 1825,
        };

        var series = await _frankfurter.GetSeriesAsync(symbol, days);
        var start = DateTimeOffset.UtcNow.Date.AddDays(-series.Count + 1);

        var candles = series.Select((rate, i) => new Candle
        {
            Time = new DateTimeOffset(start.AddDays(i), TimeSpan.Zero).ToUnixTimeSeconds(),
            Open = rate,
            High = rate,
            Low = rate,
            Close = rate,
        }).ToList();

        return new PriceHistory { Candles = candles, Currency = "TRY" };
    }
}
