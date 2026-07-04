using portfolio_service.Models;

namespace portfolio_service.DTOs;

public class AssetValueDto
{
    public Guid Id { get; set; }
    public string Symbol { get; set; } = string.Empty;
    public AssetType AssetType { get; set; }
    public decimal Quantity { get; set; }
    public decimal? AvgCostBasis { get; set; }
    public decimal? PriceInUsd { get; set; }
    public decimal PriceInTry { get; set; }
    public decimal ValueInTry { get; set; }
    public decimal? CostInTry { get; set; }
    public decimal? ProfitLossInTry { get; set; }
    public decimal? ProfitLossPercent { get; set; }
}
