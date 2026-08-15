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
}
