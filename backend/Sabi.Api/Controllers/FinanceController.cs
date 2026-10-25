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
            query = query.Where(t => t.TransactionDate >= start);
        }
        if (endDate.HasValue)
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

        IQueryable<Transaction> query = _context.Transactions
            .AsNoTracking()
            .Where(t =>
                !t.IsDeleted &&
                t.Type == TransactionType.Expense
            );

        if (startDate.HasValue)
        {
            var start = startDate.Value.Date;
            query = query.Where(t => t.TransactionDate >= start);
        }
        if (endDate.HasValue)
        {
            var exclusiveEnd = endDate.Value.Date.AddDays(1);
            query = query.Where(t => t.TransactionDate < exclusiveEnd);
        }

        var groupedQuery = query
            .GroupBy(t => t.CategoryId)
            .Select(g => new CategoryExpenseDto
            {
                CategoryId = g.Key,
                CategoryName = g.Select(t => t.Category.Name).FirstOrDefault() ?? string.Empty,
                TotalAmount = g.Sum(t => t.Amount)
            });

        var results = await groupedQuery.ToListAsync();

        return Ok(results);
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

        var startOfYear = new DateTime(selectedYear, 1, 1);

        IQueryable<Transaction> query = _context.Transactions
            .AsNoTracking()
            .Where(t =>
                !t.IsDeleted &&
                t.TransactionDate >= startOfYear
            );

        if (selectedYear < 9999)
        {
            var startOfNextYear = startOfYear.AddYears(1);
            query = query.Where(t => t.TransactionDate < startOfNextYear);
        }

        var groupedQuery = query
            .GroupBy(t => t.TransactionDate.Month)
            .Select(g => new MonthlyTrendDto
            {
                Year = selectedYear,
                Month = g.Key,
                TotalIncome = g.Sum(t => t.Type == TransactionType.Income ? t.Amount : 0m),
                TotalExpenses = g.Sum(t => t.Type == TransactionType.Expense ? t.Amount : 0m),
                NetCashFlow = 
                    g.Sum(t => t.Type == TransactionType.Income ? t.Amount : 0m)
                    -
                    g.Sum(t => t.Type == TransactionType.Expense ? t.Amount : 0m)
            });

        var results = await groupedQuery.OrderBy(g => g.Month).ToListAsync();
        var allMonths = Enumerable.Range(1, 12).ToList();

        var monthlyTrends = allMonths
            .Select(month =>
                results.FirstOrDefault(r => r.Month == month)
                ?? new MonthlyTrendDto
                {
                    Year = selectedYear,
                    Month = month,
                    TotalIncome = 0m,
                    TotalExpenses = 0m,
                    NetCashFlow = 0m
                }
            )
            .ToList();

        return Ok(monthlyTrends);
    }

    [HttpGet("total-income")]
    public async Task<IActionResult> GetTotalIncome()
    {
        decimal totalIncome = await _financeService.GetTotalIncomeAsync();
        return Ok(totalIncome);
    }
}