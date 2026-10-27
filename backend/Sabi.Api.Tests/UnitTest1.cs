using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;
using Sabi.Api.Data;
using Sabi.Api.Services;
using Sabi.Api.Models;
using Sabi.Api.Enums;
using Xunit;

namespace Sabi.Api.Tests;

public class FinanceServiceTests
{
    [Fact]
    public async Task GetFinancialSummaryAsync_ShouldCalculateCorrectTotals()
    {
        using var connection = new SqliteConnection("Data Source=:memory:");

        await connection.OpenAsync();

        var options = new DbContextOptionsBuilder<SabiDbContext>()
            .UseSqlite(connection)
            .Options;

        using var context = new SabiDbContext(options);

        await context.Database.EnsureCreatedAsync();

        var account = new Account
        {
            Name = "Test Wallet",
            InitialBalance = 5000m
        };

        context.Accounts.Add(account);

        await context.SaveChangesAsync();

        var category = new Category
        {
            Name = "Test Income",
            Type = TransactionType.Income
        };

        context.Categories.Add(category);

        await context.SaveChangesAsync();

        var incomeTransaction = new Transaction
        {
            AccountId = account.Id,
            CategoryId = category.Id,
            Type = TransactionType.Income,
            Amount = 10000m,
            Description = "Test Salary",
            TransactionDate = new DateTime(2026, 10, 27)
        };

        context.Transactions.Add(incomeTransaction);

        await context.SaveChangesAsync();

        var expenseCategory = new Category
        {
            Name = "Test Food",
            Type = TransactionType.Expense
        };

        context.Categories.Add(expenseCategory);

        await context.SaveChangesAsync();

        var expenseTransaction = new Transaction
        {
            AccountId = account.Id,
            CategoryId = expenseCategory.Id,
            Type = TransactionType.Expense,
            Amount = 3000m,
            Description = "Test Groceries",
            TransactionDate = new DateTime(2026, 10, 27)
        };

        context.Transactions.Add(expenseTransaction);

        await context.SaveChangesAsync();

        var deletedTransaction = new Transaction
        {
            AccountId = account.Id,
            CategoryId = expenseCategory.Id,
            Type = TransactionType.Expense,
            Amount = 2000m,
            Description = "Deleted Purchase",
            TransactionDate = new DateTime(2026, 10, 27),
            IsDeleted = true
        };

        context.Transactions.Add(deletedTransaction);

        await context.SaveChangesAsync();

        // Act
        var financeService = new FinanceService(context);

        var result = await financeService.GetFinancialSummaryAsync(
            null,
            null
        );

        // Assert
        Assert.Equal(10000m, result.TotalIncome);
        Assert.Equal(3000m, result.TotalExpenses);
        Assert.Equal(7000m, result.NetCashFlow);
        Assert.Equal(12000m, result.CombinedBalance);
    }
}