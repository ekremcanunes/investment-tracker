using Microsoft.AspNetCore.Mvc;
using portfolio_service.Services;

namespace portfolio_service.Controllers;

[ApiController]
[Route("api/market")]
public class MarketController(IMarketServiceClient marketServiceClient) : ControllerBase
{
    [HttpGet("search")]
    public async Task<ActionResult<List<SymbolSearchResponse>>> Search([FromQuery] string? q)
    {
        if (string.IsNullOrWhiteSpace(q) || q.Trim().Length < 2)
            return Ok(new List<SymbolSearchResponse>());
        return Ok(await marketServiceClient.SearchAsync(q.Trim()));
    }

    [HttpGet("overview")]
    public async Task<ActionResult<MarketOverviewResponse>> Overview()
    {
        return Ok(await marketServiceClient.GetOverviewAsync());
    }

    // Grafik serisi — market-service'e geçirilir (nginx tüm /api/'yi buraya yönlendirir)
    [HttpGet("history/{symbol}")]
    public async Task<ActionResult<PriceHistoryResponse>> History(string symbol,
        [FromQuery] string assetType = "Stock", [FromQuery] string range = "1mo")
    {
        if (string.IsNullOrWhiteSpace(symbol)) return BadRequest();
        return Ok(await marketServiceClient.GetHistoryAsync(symbol.Trim(), assetType, range));
    }
}
