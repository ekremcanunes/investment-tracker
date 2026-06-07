using Microsoft.AspNetCore.Mvc;
using portfolio_service.DTOs;
using portfolio_service.Services;

namespace portfolio_service.Controllers;

[ApiController]
[Route("api/dashboard")]
public class DashboardController(IPortfolioService portfolioService) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<DashboardDto>> GetDashboard()
    {
        return Ok(await portfolioService.GetDashboardAsync());
    }
}
