using Microsoft.AspNetCore.Mvc;
using portfolio_service.DTOs;
using portfolio_service.Services;

namespace portfolio_service.Controllers;

[ApiController]
[Route("api/portfolios")]
public class PortfolioController(IPortfolioService portfolioService) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<List<PortfolioDto>>> GetAll()
    {
        return Ok(await portfolioService.GetAllAsync());
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<PortfolioDto>> GetById(Guid id)
    {
        var portfolio = await portfolioService.GetByIdAsync(id);
        return portfolio is null ? NotFound() : Ok(portfolio);
    }

    [HttpPost]
    public async Task<ActionResult<PortfolioDto>> Create(CreatePortfolioDto dto)
    {
        var portfolio = await portfolioService.CreateAsync(dto);
        return CreatedAtAction(nameof(GetById), new { id = portfolio.Id }, portfolio);
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var deleted = await portfolioService.DeleteAsync(id);
        return deleted ? NoContent() : NotFound();
    }

    [HttpGet("{id:guid}/assets")]
    public async Task<ActionResult<List<AssetDto>>> GetAssets(Guid id)
    {
        return Ok(await portfolioService.GetAssetsAsync(id));
    }

    [HttpPost("{id:guid}/assets")]
    public async Task<ActionResult<AssetDto>> AddAsset(Guid id, CreateAssetDto dto)
    {
        var asset = await portfolioService.AddAssetAsync(id, dto);
        return CreatedAtAction(nameof(GetAssets), new { id }, asset);
    }

    [HttpDelete("{id:guid}/assets/{assetId:guid}")]
    public async Task<IActionResult> DeleteAsset(Guid id, Guid assetId)
    {
        var deleted = await portfolioService.DeleteAssetAsync(id, assetId);
        return deleted ? NoContent() : NotFound();
    }

    [HttpGet("{id:guid}/summary")]
    public async Task<ActionResult<PortfolioSummaryDto>> GetSummary(Guid id)
    {
        var summary = await portfolioService.GetSummaryAsync(id);
        return summary is null ? NotFound() : Ok(summary);
    }
}
