using System.Globalization;
using System.Text;
using System.Text.Json;
using market_service.Models;
using Microsoft.Extensions.Caching.Distributed;

namespace market_service.Services;

public interface ISymbolSearchService
{
    Task<List<SymbolSearchResult>> SearchAsync(string query);
}

public class SymbolSearchService : ISymbolSearchService
{
    private const string BistCacheKey = "bist:stocks";
    private const int MaxResults = 15;

    // Twelve Data'nın İngilizce isimle döndürdüğü BIST hisseleri için Türkçe arama takma adı
    private static readonly Dictionary<string, string> TurkishAliases = new(StringComparer.OrdinalIgnoreCase)
    {
        ["THYAO"] = "Türk Hava Yolları",
    };

    private readonly ITwelveDataClient _twelveDataClient;
    private readonly IDistributedCache _cache;
    private readonly ILogger<SymbolSearchService> _logger;

    public SymbolSearchService(ITwelveDataClient twelveDataClient, IDistributedCache cache,
        ILogger<SymbolSearchService> logger)
    {
        _twelveDataClient = twelveDataClient;
        _cache = cache;
        _logger = logger;
    }

    public async Task<List<SymbolSearchResult>> SearchAsync(string query)
    {
        var q = Normalize(query);
        var bist = await GetBistStocksAsync();

        // BIST: sembol, isim veya Türkçe takma ad üzerinde diakritik-duyarsız eşleşme
        var merged = bist
            .Where(s => Normalize(s.Symbol).Contains(q)
                        || Normalize(s.Name).Contains(q)
                        || (TurkishAliases.TryGetValue(s.Symbol, out var alias) && Normalize(alias).Contains(q)))
            .Take(MaxResults)
            .ToList();

        // Global arama (US/diğer borsalar) — BIST'te olmayan sonuçları tekrarsız ekle
        var seen = new HashSet<string>(merged.Select(m => m.Symbol), StringComparer.OrdinalIgnoreCase);
        foreach (var g in await _twelveDataClient.SearchSymbolsAsync(query))
        {
            if (merged.Count >= MaxResults) break;
            if (seen.Add(g.Symbol)) merged.Add(g);
        }

        return merged;
    }

    private async Task<List<SymbolSearchResult>> GetBistStocksAsync()
    {
        var cached = await _cache.GetStringAsync(BistCacheKey);
        if (cached != null)
            return JsonSerializer.Deserialize<List<SymbolSearchResult>>(cached) ?? [];

        var stocks = await _twelveDataClient.GetBistStocksAsync();
        if (stocks.Count > 0)
        {
            await _cache.SetStringAsync(BistCacheKey, JsonSerializer.Serialize(stocks),
                new DistributedCacheEntryOptions { AbsoluteExpirationRelativeToNow = TimeSpan.FromHours(24) });
        }
        return stocks;
    }

    // Diakritik-duyarsız normalize: NFD ile ayrıştır, birleşik işaretleri at, küçük harfe çevir.
    // "Türk Hava" == "turk hava", "Koç" == "koc", "Şişe" == "sise" olur.
    private static string Normalize(string input)
    {
        if (string.IsNullOrEmpty(input)) return string.Empty;
        var decomposed = input.Normalize(NormalizationForm.FormD);
        var sb = new StringBuilder(decomposed.Length);
        foreach (var ch in decomposed)
        {
            if (CharUnicodeInfo.GetUnicodeCategory(ch) == UnicodeCategory.NonSpacingMark)
                continue;
            // Türkçe noktasız ı ve İ'nin ayrıştırmasından gelen I → i
            sb.Append(ch is 'ı' or 'I' ? 'i' : char.ToLowerInvariant(ch));
        }
        return sb.ToString();
    }
}
