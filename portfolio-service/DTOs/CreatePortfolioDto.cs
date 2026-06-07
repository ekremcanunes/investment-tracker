namespace portfolio_service.DTOs;

public class CreatePortfolioDto
{
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
}
