using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Sabi.Api.Data;
using Sabi.Api.Enums;
using Sabi.Api.DTOs;
using Sabi.Api.Models;
using Sabi.Api.Services;
namespace Sabi.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class FinanceController : ControllerBase
{
    private readonly SabiDbContext _context;
    private readonly FinanceService _financeService;

    public FinanceController
    (
        SabiDbContext context,
        FinanceService financeService
    )
    {
        _context = context;
        _financeService = financeService;

    }

    // Get: /api/Finance/summary
    [HttpGet("Summary")]
    public async Task<IActionResult> GetFinancialSummary
    (
        [FromQuery] DateTime? startDate,
        [FromQuery] DateTime? endDate
    )
    {
        // Date Validation (ladder for readability)
        if (endDate.HasValue && startDate.HasValue)
        {
            if (startDate.Value.Date > endDate.Value.Date)
            {
                return BadRequest("Start date cannot be later than end date");
            }
        }
        if (endDate.HasValue && endDate.Value.Date == DateTime.MaxValue.Date)
        {
            return BadRequest("End date is out of supported range");
        }

        var response = await _financeService.GetFinancialSummaryAsync(startDate, endDate
        );

        return Ok(response);
    }

    // GET: /api/finance/expense-by-category
    [HttpGet("expenses-by-category")]
    public async Task<IActionResult> GetExpensesByCategory
    (
        [FromQuery] DateTime? startDate,
        [FromQuery] DateTime? endDate
    )
    {
        // Date Validation (ladder for readability)
        if (endDate.HasValue && startDate.HasValue)
        {
            if (startDate.Value.Date > endDate.Value.Date)
            {
                return BadRequest("Start date cannot be later than end date");
            }
        }
        if (endDate.HasValue && endDate.Value.Date == DateTime.MaxValue.Date)
        {
            return BadRequest("End date is out of supported range");
        }

        var response = await _financeService.GetExpensesByCategoryAsync(startDate, endDate);

        return Ok(response);
    }

    // GET: /api/finance/monthly-trends
    [HttpGet("monthly-trends")]
    public async Task<IActionResult> GetMonthlyTrends
    (
        [FromQuery] int? year
    )
    {
        int selectedYear = year ?? DateTime.Now.Year;

        if (selectedYear < 1 || selectedYear > 9999)
        {
            return BadRequest("Year must be between 1 and 9999.");
        }

        var monthlyTrends = await _financeService.GetMonthlyTrendsAsync(selectedYear);
        return Ok(monthlyTrends);
    }

    // Get: /api/finance/dashboard
    [HttpGet("dashboard")]
    public async Task<IActionResult> GetDashboard(
        [FromQuery] int? year
    )
    {
        int selectedYear = year ?? DateTime.Now.Year;

        if (selectedYear < 1 || selectedYear >= 9999)
        {
            return BadRequest("Dashboard year must be between 1 and 9998.");
        }

        var response = await _financeService.GetDashboardAsync(selectedYear);
        
        return Ok(response);
    }
    
    [HttpGet("total-income")]
    public async Task<IActionResult> GetTotalIncome()
    {
        decimal totalIncome = await _financeService.GetTotalIncomeAsync();
        return Ok(totalIncome);
    }
}