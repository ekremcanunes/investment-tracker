namespace portfolio_service.Models;

public class Asset
{
    public Guid Id { get; set; }
    public Guid PortfolioId { get; set; }
    public string Symbol { get; set; } = string.Empty;
    public AssetType AssetType { get; set; }
    public decimal Quantity { get; set; }
    public decimal? AvgCostBasis { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public Portfolio Portfolio { get; set; } = null!;
    public ICollection<Transaction> Transactions { get; set; } = new List<Transaction>();
}
