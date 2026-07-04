using Microsoft.AspNetCore.Mvc;
using portfolio_service.DTOs;
using portfolio_service.Services;

namespace portfolio_service.Controllers;

[ApiController]
[Route("api/portfolios")]
public class PortfolioController(IPortfolioService portfolioService) : ControllerBase
{
    private string UserId => HttpContext.Items["UserId"]?.ToString()!;

    [HttpGet]
    public async Task<ActionResult<List<PortfolioDto>>> GetAll()
    {
        return Ok(await portfolioService.GetAllAsync(UserId));
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<PortfolioDto>> GetById(Guid id)
    {
        var portfolio = await portfolioService.GetByIdAsync(id, UserId);
        return portfolio is null ? NotFound() : Ok(portfolio);
    }

    [HttpPost]
    public async Task<ActionResult<PortfolioDto>> Create(CreatePortfolioDto dto)
    {
        var portfolio = await portfolioService.CreateAsync(dto, UserId);
        return CreatedAtAction(nameof(GetById), new { id = portfolio.Id }, portfolio);
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var deleted = await portfolioService.DeleteAsync(id, UserId);
        return deleted ? NoContent() : NotFound();
    }

    [HttpGet("{id:guid}/assets")]
    public async Task<ActionResult<List<AssetDto>>> GetAssets(Guid id)
    {
        return Ok(await portfolioService.GetAssetsAsync(id, UserId));
    }

    [HttpPost("{id:guid}/assets")]
    public async Task<ActionResult<AssetDto>> AddAsset(Guid id, CreateAssetDto dto)
    {
        var asset = await portfolioService.AddAssetAsync(id, dto, UserId);
        return CreatedAtAction(nameof(GetAssets), new { id }, asset);
    }

    [HttpPut("{id:guid}/assets/{assetId:guid}")]
    public async Task<ActionResult<AssetDto>> UpdateAsset(Guid id, Guid assetId, UpdateAssetDto dto)
    {
        if (dto.Quantity is <= 0)
            return BadRequest(new { error = new { code = "VALIDATION_ERROR", message = "Quantity must be greater than zero" } });
        if (dto.PurchasePrice is < 0)
            return BadRequest(new { error = new { code = "VALIDATION_ERROR", message = "Purchase price cannot be negative" } });

        var result = await portfolioService.UpdateAssetAsync(id, assetId, dto, UserId);
        return result is null ? NotFound() : Ok(result);
    }

    [HttpDelete("{id:guid}/assets/{assetId:guid}")]
    public async Task<IActionResult> DeleteAsset(Guid id, Guid assetId)
    {
        var deleted = await portfolioService.DeleteAssetAsync(id, assetId, UserId);
        return deleted ? NoContent() : NotFound();
    }

    [HttpGet("{id:guid}/summary")]
    public async Task<ActionResult<PortfolioSummaryDto>> GetSummary(Guid id)
    {
        var summary = await portfolioService.GetSummaryAsync(id, UserId);
        return summary is null ? NotFound() : Ok(summary);
    }
}
