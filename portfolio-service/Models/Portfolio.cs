namespace portfolio_service.Models;

public class Portfolio
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public string UserId { get; set; } = string.Empty;
    public ICollection<Asset> Assets { get; set; } = new List<Asset>();
}
