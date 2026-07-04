using portfolio_service.DTOs;

namespace portfolio_service.Services;

public interface IPortfolioService
{
    Task<List<PortfolioDto>> GetAllAsync(string userId);
    Task<PortfolioDto?> GetByIdAsync(Guid id, string userId);
    Task<PortfolioDto> CreateAsync(CreatePortfolioDto dto, string userId);
    Task<bool> DeleteAsync(Guid id, string userId);
    Task<List<AssetDto>> GetAssetsAsync(Guid portfolioId, string userId);
    Task<AssetDto> AddAssetAsync(Guid portfolioId, CreateAssetDto dto, string userId);
    Task<AssetDto?> UpdateAssetAsync(Guid portfolioId, Guid assetId, UpdateAssetDto dto, string userId);
    Task<bool> DeleteAssetAsync(Guid portfolioId, Guid assetId, string userId);
    Task<PortfolioSummaryDto?> GetSummaryAsync(Guid portfolioId, string userId);
    Task<DashboardDto> GetDashboardAsync(string userId);
}
