using System.Text.Json;

namespace market_service.Services;

// Yahoo Finance chart meta'sından çekilen ham quote (native para biriminde)
public record YahooQuote(
    decimal Price,
    decimal? PreviousClose,
    decimal? DayHigh,
    decimal? DayLow,
    decimal? Week52High,
    decimal? Week52Low,
    long? Volume,
    string Currency,
    string Exchange);

public interface IYahooFinanceClient
{
    Task<YahooQuote?> GetQuoteAsync(string yahooSymbol);
}

public class YahooFinanceClient(HttpClient httpClient, ILogger<YahooFinanceClient> logger) : IYahooFinanceClient
{
    public async Task<YahooQuote?> GetQuoteAsync(string yahooSymbol)
    {
        try
        {
            var url = $"https://query1.finance.yahoo.com/v8/finance/chart/{Uri.EscapeDataString(yahooSymbol)}?interval=1d&range=1d";
            var request = new HttpRequestMessage(HttpMethod.Get, url);
            // Yahoo varsayılan istemcileri engeller; tarayıcı User-Agent gerekli
            request.Headers.Add("User-Agent", "Mozilla/5.0");

            var response = await httpClient.SendAsync(request);
            response.EnsureSuccessStatusCode();

            var json = await response.Content.ReadAsStringAsync();
            using var doc = JsonDocument.Parse(json);

            var result = doc.RootElement.GetProperty("chart").GetProperty("result");
            if (result.ValueKind != JsonValueKind.Array || result.GetArrayLength() == 0)
                return null;

            var meta = result[0].GetProperty("meta");

            if (!TryGetDecimal(meta, "regularMarketPrice", out var price))
            {
                logger.LogWarning("No price in Yahoo response for {Symbol}", yahooSymbol);
                return null;
            }

            // previousClose bazen null döner; chartPreviousClose yedek
            decimal? prevClose = TryGetDecimal(meta, "previousClose", out var pc) ? pc
                : TryGetDecimal(meta, "chartPreviousClose", out var cpc) ? cpc : null;

            return new YahooQuote(
                Price: price,
                PreviousClose: prevClose,
                DayHigh: TryGetDecimal(meta, "regularMarketDayHigh", out var dh) ? dh : null,
                DayLow: TryGetDecimal(meta, "regularMarketDayLow", out var dl) ? dl : null,
                Week52High: TryGetDecimal(meta, "fiftyTwoWeekHigh", out var wh) ? wh : null,
                Week52Low: TryGetDecimal(meta, "fiftyTwoWeekLow", out var wl) ? wl : null,
                Volume: meta.TryGetProperty("regularMarketVolume", out var v) && v.ValueKind == JsonValueKind.Number ? v.GetInt64() : null,
                Currency: meta.TryGetProperty("currency", out var c) ? c.GetString() ?? "USD" : "USD",
                Exchange: meta.TryGetProperty("exchangeName", out var e) ? e.GetString() ?? string.Empty : string.Empty);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Failed to get Yahoo quote for {Symbol}", yahooSymbol);
            return null;
        }
    }

    private static bool TryGetDecimal(JsonElement el, string prop, out decimal value)
    {
        value = 0m;
        if (el.TryGetProperty(prop, out var p) && p.ValueKind == JsonValueKind.Number)
        {
            value = p.GetDecimal();
            return true;
        }
        return false;
    }
}
