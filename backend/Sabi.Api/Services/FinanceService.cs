using Microsoft.AspNetCore.Http.HttpResults;
using Sabi.Api.Data;
namespace Sabi.Api.Services;

using Microsoft.EntityFrameworkCore;
using Sabi.Api.Enums;
using Sabi.Api.DTOs;
using Sabi.Api.Models;
using Sabi.Api.DTO;

public class FinanceService
{
    private readonly SabiDbContext _context;

    public FinanceService(SabiDbContext context)
    {
        _context = context;
    }

    public async Task<decimal> GetTotalIncomeAsync()
    {
        return await _context.Transactions
            .AsNoTracking()
            .Where(t => !t.IsDeleted && t.Type == TransactionType.Income)
            .SumAsync(t => t.Amount);
    }
    public async Task<FinancialSummaryDto> GetFinancialSummaryAsync(
        DateTime? startDate,
        DateTime? endDate
    )
    {
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

        return response;
    }
    public async Task<List<CategoryExpenseDto>> GetExpensesByCategoryAsync(
        DateTime? startDate,
        DateTime? endDate
    )
    {
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

        return results;
    }
    public async Task<List<MonthlyTrendDto>> GetMonthlyTrendsAsync(
        int selectedYear
    )
    {
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

        return monthlyTrends;
    }

    public async Task<DashboardResponseDto> GetDashboardAsync(int year)
    {
        if (year < 1 || year >= 9999)
        {
            throw new ArgumentOutOfRangeException(
                nameof(year),
                "Dashboard year must be between 1 and 9998."
            );
        }
        DateTime startDate = new DateTime(year, 1, 1);
        DateTime endDate = new DateTime(year, 12, 31);

        FinancialSummaryDto summary = await GetFinancialSummaryAsync(startDate, endDate);

        List<CategoryExpenseDto> expensesByCategory = await GetExpensesByCategoryAsync(startDate, endDate);

        List<MonthlyTrendDto> monthlyTrends = await GetMonthlyTrendsAsync(year);

        var response = new DashboardResponseDto
        {
            Summary = summary,
            ExpensesByCategory = expensesByCategory,
            MonthlyTrends = monthlyTrends
        };

        return response;
    }
}