using portfolio_service.Models;

namespace portfolio_service.DTOs;

public class TransactionDto
{
    public Guid Id { get; set; }
    public TransactionType Type { get; set; }
    public decimal Amount { get; set; }
    public string Currency { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty;
    public List<string> Tags { get; set; } = new();
    public string? Description { get; set; }
    public DateTime Date { get; set; }
    public int? InstallmentTotal { get; set; }
    public int? InstallmentCurrent { get; set; }
    public decimal? InstallmentMonthlyAmount { get; set; }
    public Guid? AssetId { get; set; }
    public DateTime CreatedAt { get; set; }
}
