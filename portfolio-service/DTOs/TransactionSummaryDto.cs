namespace portfolio_service.DTOs;

public class TransactionSummaryDto
{
    public decimal TotalIncome { get; set; }
    public decimal TotalExpense { get; set; }
    public decimal NetFlow { get; set; }
    public List<CategoryTotalDto> ByCategory { get; set; } = new();
}

public class CategoryTotalDto
{
    public string Type { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty;
    public decimal Total { get; set; }
}
