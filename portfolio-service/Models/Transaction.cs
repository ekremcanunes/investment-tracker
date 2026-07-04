namespace portfolio_service.Models;

public class Transaction
{
    public Guid Id { get; set; }
    public string UserId { get; set; } = string.Empty;
    public TransactionType Type { get; set; }
    public decimal Amount { get; set; }
    public string Currency { get; set; } = "TRY";
    public string Category { get; set; } = string.Empty;
    public List<string> Tags { get; set; } = new();
    public string? Description { get; set; }
    public DateTime Date { get; set; }
    public int? InstallmentTotal { get; set; }
    public int? InstallmentCurrent { get; set; }
    public decimal? InstallmentMonthlyAmount { get; set; }
    public Guid? AssetId { get; set; }
    public Asset? Asset { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}
