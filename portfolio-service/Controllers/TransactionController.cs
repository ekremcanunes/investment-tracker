using Microsoft.AspNetCore.Mvc;
using portfolio_service.DTOs;
using portfolio_service.Services;

namespace portfolio_service.Controllers;

[ApiController]
[Route("api/transactions")]
public class TransactionController(ITransactionService transactionService) : ControllerBase
{
    private string UserId => HttpContext.Items["UserId"]?.ToString()!;

    [HttpGet]
    public async Task<ActionResult<PagedResultDto<TransactionDto>>> GetAll([FromQuery] TransactionFilterDto filter)
    {
        return Ok(await transactionService.GetAllAsync(filter, UserId));
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<TransactionDto>> GetById(Guid id)
    {
        var result = await transactionService.GetByIdAsync(id, UserId);
        return result is null ? NotFound() : Ok(result);
    }

    [HttpPost]
    public async Task<ActionResult<TransactionDto>> Create(CreateTransactionDto dto)
    {
        if (dto.Type is Models.TransactionType.AssetBuy or Models.TransactionType.AssetSell)
            return BadRequest(new { error = new { code = "VALIDATION_ERROR", message = "Asset transactions must go through /api/assets/buy or /api/assets/{id}/sell" } });
        if (dto.Amount <= 0)
            return BadRequest(new { error = new { code = "VALIDATION_ERROR", message = "Amount must be greater than zero" } });
        if (string.IsNullOrWhiteSpace(dto.Category))
            return BadRequest(new { error = new { code = "VALIDATION_ERROR", message = "Category is required" } });
        if (dto.Date == default)
            return BadRequest(new { error = new { code = "VALIDATION_ERROR", message = "Date is required" } });
        if (dto.InstallmentTotal.HasValue && dto.InstallmentTotal < 2)
            return BadRequest(new { error = new { code = "VALIDATION_ERROR", message = "Installment total must be at least 2" } });

        var result = await transactionService.CreateAsync(dto, UserId);
        return CreatedAtAction(nameof(GetById), new { id = result.Id }, result);
    }

    [HttpPut("{id:guid}")]
    public async Task<ActionResult<TransactionDto>> Update(Guid id, UpdateTransactionDto dto)
    {
        if (dto.Amount.HasValue && dto.Amount <= 0)
            return BadRequest(new { error = new { code = "VALIDATION_ERROR", message = "Amount must be greater than zero" } });
        if (dto.InstallmentTotal.HasValue && dto.InstallmentTotal < 2)
            return BadRequest(new { error = new { code = "VALIDATION_ERROR", message = "Installment total must be at least 2" } });

        var result = await transactionService.UpdateAsync(id, dto, UserId);
        return result is null ? NotFound() : Ok(result);
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var deleted = await transactionService.DeleteAsync(id, UserId);
        return deleted ? NoContent() : NotFound();
    }

    [HttpGet("summary")]
    public async Task<ActionResult<TransactionSummaryDto>> GetSummary([FromQuery] DateTime? from, [FromQuery] DateTime? to)
    {
        return Ok(await transactionService.GetSummaryAsync(from, to, UserId));
    }
}
