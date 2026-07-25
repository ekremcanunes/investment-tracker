using market_service.Models;
using market_service.Services;
using Microsoft.AspNetCore.Mvc;

namespace market_service.Controllers;

[ApiController]
[Route("api/market")]
public class MarketController : ControllerBase
{
    private readonly IMarketService _marketService;
    private readonly ISymbolSearchService _searchService;

    public MarketController(IMarketService marketService, ISymbolSearchService searchService)
    {
        _marketService = marketService;
        _searchService = searchService;
    }

    [HttpGet("prices")]
    public async Task<ActionResult<List<MarketPrice>>> GetPrices([FromQuery] string? symbols)
    {
        if (string.IsNullOrWhiteSpace(symbols)) return Ok(new List<MarketPrice>());
        var symbolList = symbols.Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries);
        var prices = await _marketService.GetPricesAsync(symbolList);
        return Ok(prices);
    }

    [HttpGet("price/{symbol}")]
    public async Task<ActionResult<MarketPrice>> GetPrice(string symbol)
    {
        var price = await _marketService.GetPriceAsync(symbol);
        if (price == null) return NotFound();
        return Ok(price);
    }

    [HttpGet("search")]
    public async Task<ActionResult<List<SymbolSearchResult>>> Search([FromQuery] string? q)
    {
        if (string.IsNullOrWhiteSpace(q) || q.Trim().Length < 2)
            return Ok(new List<SymbolSearchResult>());
        var results = await _searchService.SearchAsync(q.Trim());
        return Ok(results);
    }
}
