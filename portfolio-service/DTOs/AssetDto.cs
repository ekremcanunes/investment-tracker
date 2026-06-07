using portfolio_service.Models;

namespace portfolio_service.DTOs;

public class AssetDto
{
    public Guid Id { get; set; }
    public string Symbol { get; set; } = string.Empty;
    public AssetType AssetType { get; set; }
    public decimal Quantity { get; set; }
    public string PortfolioName { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
}
