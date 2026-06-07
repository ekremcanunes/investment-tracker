using portfolio_service.Models;

namespace portfolio_service.DTOs;

public class CreateAssetDto
{
    public string Symbol { get; set; } = string.Empty;
    public AssetType AssetType { get; set; }
    public decimal Quantity { get; set; }
}
