using Microsoft.EntityFrameworkCore;
using portfolio_service.Data;
using portfolio_service.DTOs;
using portfolio_service.Models;

namespace portfolio_service.Services;

public class TransactionService(AppDbContext db) : ITransactionService
{
    public async Task<PagedResultDto<TransactionDto>> GetAllAsync(TransactionFilterDto filter, string userId)
    {
        var query = db.Transactions.Where(t => t.UserId == userId).AsQueryable();

        if (filter.Type.HasValue)
            query = query.Where(t => t.Type == filter.Type.Value);
        if (!string.IsNullOrWhiteSpace(filter.Category))
            query = query.Where(t => t.Category == filter.Category);
        if (!string.IsNullOrWhiteSpace(filter.Tag))
            query = query.Where(t => t.Tags.Contains(filter.Tag));
        if (filter.From.HasValue)
            query = query.Where(t => t.Date >= filter.From.Value);
        if (filter.To.HasValue)
            query = query.Where(t => t.Date <= filter.To.Value);
        if (!string.IsNullOrWhiteSpace(filter.Search))
            query = query.Where(t =>
                (t.Description != null && t.Description.Contains(filter.Search)) ||
                t.Category.Contains(filter.Search));

        var total = await query.CountAsync();

        var page = Math.Max(1, filter.Page);
        var pageSize = Math.Clamp(filter.PageSize, 1, 100);

        var items = await query
            .OrderByDescending(t => t.Date)
            .ThenByDescending(t => t.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(t => MapToDto(t))
            .ToListAsync();

        return new PagedResultDto<TransactionDto> { Items = items, Total = total, Page = page, PageSize = pageSize };
    }

    public async Task<TransactionDto?> GetByIdAsync(Guid id, string userId)
    {
        var t = await db.Transactions.FirstOrDefaultAsync(t => t.Id == id && t.UserId == userId);
        return t is null ? null : MapToDto(t);
    }

    public async Task<TransactionDto> CreateAsync(CreateTransactionDto dto, string userId)
    {
        var transaction = new Transaction
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            Type = dto.Type,
            Amount = dto.Amount,
            Currency = dto.Currency,
            Category = dto.Category.Trim(),
            Tags = dto.Tags ?? new(),
            Description = dto.Description?.Trim(),
            Date = dto.Date,
            InstallmentTotal = dto.InstallmentTotal,
            InstallmentCurrent = dto.InstallmentCurrent,
            InstallmentMonthlyAmount = dto.InstallmentMonthlyAmount,
            AssetId = dto.AssetId
        };

        db.Transactions.Add(transaction);
        await db.SaveChangesAsync();

        return MapToDto(transaction);
    }

    public async Task<TransactionDto?> UpdateAsync(Guid id, UpdateTransactionDto dto, string userId)
    {
        var transaction = await db.Transactions.FirstOrDefaultAsync(t => t.Id == id && t.UserId == userId);
        if (transaction is null) return null;

        if (dto.Type.HasValue) transaction.Type = dto.Type.Value;
        if (dto.Amount.HasValue) transaction.Amount = dto.Amount.Value;
        if (dto.Currency is not null) transaction.Currency = dto.Currency;
        if (dto.Category is not null) transaction.Category = dto.Category.Trim();
        if (dto.Tags is not null) transaction.Tags = dto.Tags;
        if (dto.Description is not null) transaction.Description = dto.Description.Trim();
        if (dto.Date.HasValue) transaction.Date = dto.Date.Value;
        if (dto.InstallmentTotal.HasValue) transaction.InstallmentTotal = dto.InstallmentTotal;
        if (dto.InstallmentCurrent.HasValue) transaction.InstallmentCurrent = dto.InstallmentCurrent;
        if (dto.InstallmentMonthlyAmount.HasValue) transaction.InstallmentMonthlyAmount = dto.InstallmentMonthlyAmount;
        transaction.UpdatedAt = DateTime.UtcNow;

        await db.SaveChangesAsync();
        return MapToDto(transaction);
    }

    public async Task<bool> DeleteAsync(Guid id, string userId)
    {
        var transaction = await db.Transactions.FirstOrDefaultAsync(t => t.Id == id && t.UserId == userId);
        if (transaction is null) return false;

        db.Transactions.Remove(transaction);
        await db.SaveChangesAsync();
        return true;
    }

    public async Task<TransactionSummaryDto> GetSummaryAsync(DateTime? from, DateTime? to, string userId)
    {
        var query = db.Transactions.Where(t => t.UserId == userId);
        if (from.HasValue) query = query.Where(t => t.Date >= from.Value);
        if (to.HasValue) query = query.Where(t => t.Date <= to.Value);

        var transactions = await query.ToListAsync();

        var totalIncome = transactions.Where(t => t.Type == TransactionType.Income).Sum(t => t.Amount);
        var totalExpense = transactions.Where(t => t.Type == TransactionType.Expense).Sum(t => t.Amount);

        var byCategory = transactions
            .GroupBy(t => new { Type = t.Type.ToString(), t.Category })
            .Select(g => new CategoryTotalDto { Type = g.Key.Type, Category = g.Key.Category, Total = g.Sum(t => t.Amount) })
            .OrderByDescending(x => x.Total)
            .ToList();

        return new TransactionSummaryDto
        {
            TotalIncome = totalIncome,
            TotalExpense = totalExpense,
            NetFlow = totalIncome - totalExpense,
            ByCategory = byCategory
        };
    }

    private static TransactionDto MapToDto(Transaction t) => new()
    {
        Id = t.Id,
        Type = t.Type,
        Amount = t.Amount,
        Currency = t.Currency,
        Category = t.Category,
        Tags = t.Tags,
        Description = t.Description,
        Date = t.Date,
        InstallmentTotal = t.InstallmentTotal,
        InstallmentCurrent = t.InstallmentCurrent,
        InstallmentMonthlyAmount = t.InstallmentMonthlyAmount,
        Symbol = t.Symbol,
        Quantity = t.Quantity,
        UnitPrice = t.UnitPrice,
        RealizedProfitLoss = t.RealizedProfitLoss,
        AssetId = t.AssetId,
        CreatedAt = t.CreatedAt
    };
}
