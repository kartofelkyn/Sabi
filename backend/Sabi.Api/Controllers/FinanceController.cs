using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Sabi.Api.Data;
using Sabi.Api.Enums;
using Sabi.Api.DTOs;
using Sabi.Api.Models;
namespace Sabi.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class FinanceController : ControllerBase
{
    private readonly SabiDbContext _context;

    public FinanceController(SabiDbContext context)
    {
        _context = context;
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

        IQueryable<Transaction> query = _context.Transactions
            .AsNoTracking()
            .Where(t => !t.IsDeleted);
        
        var allTimeQuery = _context.Transactions
            .AsNoTracking()
            .Where(t => !t.IsDeleted);

        decimal totalInitialBalance = await _context.Accounts
            .SumAsync(a => a.InitialBalance);

        if (startDate.HasValue)
        {
            var start = startDate.Value.Date;
            query = query. Where(t => t.TransactionDate >= start);
        }
        if(endDate.HasValue)
        {
            var exclusiveEnd = endDate.Value.Date.AddDays(1);
            query = query.Where(t => t.TransactionDate < exclusiveEnd);
        }

        decimal totalIncome = await query
            .Where(t =>
                t.Type == TransactionType.Income
            )
            .SumAsync(t => t.Amount);

        decimal totalExpenses = await query
            .Where(t =>
                t.Type == TransactionType.Expense
            )
            .SumAsync(t => t.Amount);

        decimal allTimeIncome = await allTimeQuery
            .Where(t => t.Type == TransactionType.Income)
            .SumAsync(t => t.Amount);

        decimal allTimeExpense = await allTimeQuery
            .Where(t => t.Type == TransactionType.Expense)
            .SumAsync(t => t.Amount);
            
        decimal netCashFlow = totalIncome - totalExpenses;

        decimal allTimeNetCashFlow = allTimeIncome - allTimeExpense;

        decimal combinedBalance = totalInitialBalance + allTimeNetCashFlow;

        var response = new FinancialSummaryDto
        {
            TotalIncome = totalIncome,
            TotalExpenses = totalExpenses,
            NetCashFlow = netCashFlow,
            CombinedBalance = combinedBalance
        };

        return Ok(response);
    }
}