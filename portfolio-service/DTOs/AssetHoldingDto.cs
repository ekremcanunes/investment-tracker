using portfolio_service.Models;

namespace portfolio_service.DTOs;

public class AssetHoldingDto
{
    public Guid Id { get; set; }
    public string Symbol { get; set; } = string.Empty;
    public AssetType AssetType { get; set; }
    public decimal Quantity { get; set; }
    // Alış para birimi — AvgCostBasis ve UnrealizedProfitLoss bu birimdedir
    public string Currency { get; set; } = "TRY";
    public decimal? AvgCostBasis { get; set; }
    public decimal? TotalCost { get; set; }
    public decimal? PriceInUsd { get; set; }
    public decimal PriceInTry { get; set; }
    public decimal ValueInTry { get; set; }
    public decimal? UnrealizedProfitLoss { get; set; }
    public decimal? UnrealizedProfitLossPercent { get; set; }
    public bool PriceAvailable { get; set; }
    public DateTime CreatedAt { get; set; }
}
