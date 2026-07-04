using portfolio_service.Models;

namespace portfolio_service.DTOs;

public class UpdateTransactionDto
{
    public TransactionType? Type { get; set; }
    public decimal? Amount { get; set; }
    public string? Currency { get; set; }
    public string? Category { get; set; }
    public List<string>? Tags { get; set; }
    public string? Description { get; set; }
    public DateTime? Date { get; set; }
    public int? InstallmentTotal { get; set; }
    public int? InstallmentCurrent { get; set; }
    public decimal? InstallmentMonthlyAmount { get; set; }
}
