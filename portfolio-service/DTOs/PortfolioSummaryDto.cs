namespace portfolio_service.DTOs;

public class PortfolioSummaryDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public decimal TotalValueInTry { get; set; }
    public List<AssetValueDto> Assets { get; set; } = new();
}
