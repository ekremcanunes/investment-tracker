namespace portfolio_service.DTOs;

public class PortfolioDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public DateTime CreatedAt { get; set; }
    public int AssetCount { get; set; }
}
