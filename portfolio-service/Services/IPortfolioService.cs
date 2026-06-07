using portfolio_service.DTOs;

namespace portfolio_service.Services;

public interface IPortfolioService
{
    Task<List<PortfolioDto>> GetAllAsync();
    Task<PortfolioDto?> GetByIdAsync(Guid id);
    Task<PortfolioDto> CreateAsync(CreatePortfolioDto dto);
    Task<bool> DeleteAsync(Guid id);
    Task<List<AssetDto>> GetAssetsAsync(Guid portfolioId);
    Task<AssetDto> AddAssetAsync(Guid portfolioId, CreateAssetDto dto);
    Task<bool> DeleteAssetAsync(Guid portfolioId, Guid assetId);
    Task<PortfolioSummaryDto?> GetSummaryAsync(Guid portfolioId);
    Task<DashboardDto> GetDashboardAsync();
}
