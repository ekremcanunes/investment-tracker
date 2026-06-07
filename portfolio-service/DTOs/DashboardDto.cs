namespace portfolio_service.DTOs;

public class DashboardDto
{
    public decimal TotalValueInTry { get; set; }
    public int PortfolioCount { get; set; }
    public int AssetCount { get; set; }
    public List<AssetDto> RecentAssets { get; set; } = new();
}
