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
        var (connection, context) = await CreateTestDatabaseAsync();

        using var dbConnection = connection;
        using var dbContext = context;

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

    [Fact]
    public async Task GetFinancialSummaryAsync_ShouldFilterTransactionsByDate()
    {
        // Arrange
        var (connection, context) = await CreateTestDatabaseAsync();

        using var dbConnection = connection;
        using var dbContext = context;

        var account = new Account
        {
            Name = "Test Wallet",
            InitialBalance = 5000m
        };

        context.Accounts.Add(account);

        await context.SaveChangesAsync();

        var incomeCategory = new Category
        {
            Name = "Salary",
            Type = TransactionType.Income
        };

        var expenseCategory = new Category
        {
            Name = "Food",
            Type = TransactionType.Expense
        };

        context.Categories.AddRange(incomeCategory, expenseCategory);

        await context.SaveChangesAsync();

        var transactions = new List<Transaction>
        {
            new Transaction
            {
                AccountId = account.Id,
                CategoryId = incomeCategory.Id,
                Type = TransactionType.Income,
                Amount = 10000m,
                Description = "October Salary",
                TransactionDate = new DateTime(2026, 10, 10)
            },
            new Transaction
            {
                AccountId = account.Id,
                CategoryId = expenseCategory.Id,
                Type = TransactionType.Expense,
                Amount = 3000m,
                Description = "Groceries",
                TransactionDate = new DateTime(2026, 10, 15)
            },
            new Transaction
            {
                AccountId = account.Id,
                CategoryId = incomeCategory.Id,
                Type = TransactionType.Income,
                Amount = 5000m,
                Description = "November Bonus",
                TransactionDate = new DateTime(2026, 11, 5)
            }
        };

        context.Transactions.AddRange(transactions);

        await context.SaveChangesAsync();

        // Act
        var financeService = new FinanceService(context);

        var startDate = new DateTime(2026, 10, 1);
        var endDate = new DateTime(2026, 10, 31);

        var result = await financeService.GetFinancialSummaryAsync(
            startDate,
            endDate
        );

        // Assert
        Assert.Equal(10000m, result.TotalIncome);
        Assert.Equal(3000m, result.TotalExpenses);
        Assert.Equal(7000m, result.NetCashFlow);
        Assert.Equal(17000m, result.CombinedBalance);

    }

    [Fact]
    public async Task GetFinancialSummaryAsync_ShouldIncludeTransactionsOnEndDate()
    {
        // Arrange
        var (connection, context) = await CreateTestDatabaseAsync();

        using var dbConnection = connection;
        using var dbContext = context;

        var account = new Account
        {
            Name = "Boundary Test Wallet",
            InitialBalance = 0m
        };

        context.Accounts.Add(account);

        await context.SaveChangesAsync();

        var incomeCategory = new Category
        {
            Name = "Boundary Test Income",
            Type = TransactionType.Income
        };

        context.Categories.Add(incomeCategory);

        await context.SaveChangesAsync();

        var transactions = new List<Transaction>
        {
            new Transaction
            {
                AccountId = account.Id,
                CategoryId = incomeCategory.Id,
                Type = TransactionType.Income,
                Amount = 2000m,
                Description = "October End-of-Day Income",
                TransactionDate = new DateTime(2026, 10, 31, 23, 59, 0)
            },
            new Transaction
            {
                AccountId = account.Id,
                CategoryId = incomeCategory.Id,
                Type = TransactionType.Income,
                Amount = 1000m,
                Description = "November Income",
                TransactionDate = new DateTime(2026, 11, 1, 0, 0, 0)
            }
        };

        context.Transactions.AddRange(transactions);

        await context.SaveChangesAsync();

        // Act
        var financeService = new FinanceService(context);

        var result = await financeService.GetFinancialSummaryAsync(
            new DateTime(2026, 10, 1),
            new DateTime(2026, 10, 31)
        );

        // Assert
        // Assert
        Assert.Equal(2000m, result.TotalIncome);
        Assert.Equal(0m, result.TotalExpenses);
        Assert.Equal(2000m, result.NetCashFlow);
        Assert.Equal(3000m, result.CombinedBalance);
    }

    [Fact]
    public async Task GetExpensesByCategoryAsync_ShouldGroupExpensesCorrectly()
    {
        // Arrange
        var (connection, context) = await CreateTestDatabaseAsync();

        using var dbConnection = connection;
        using var dbContext = context;

        var account = new Account
        {
            Name = "Expense Test Wallet",
            InitialBalance = 10000m
        };

        context.Accounts.Add(account);

        await context.SaveChangesAsync();

        var foodCategory = new Category
        {
            Name = "Food",
            Type = TransactionType.Expense
        };
        var transportationCategory = new Category
        {
            Name = "Transportation",
            Type = TransactionType.Expense
        };
        var salaryCategory = new Category
        {
            Name = "Salary",
            Type = TransactionType.Income
        };

        context.Categories.AddRange(foodCategory, transportationCategory, salaryCategory);

        await context.SaveChangesAsync();

        var transactions = new List<Transaction>
        {
            new Transaction
            {
                AccountId = account.Id,
                CategoryId = foodCategory.Id,
                Type = TransactionType.Expense,
                Amount = 500m,
                Description = "Lunch",
                TransactionDate = new DateTime(2026, 10, 28)
            },
            new Transaction
            {
                AccountId = account.Id,
                CategoryId = foodCategory.Id,
                Type = TransactionType.Expense,
                Amount = 300m,
                Description = "Dinner",
                TransactionDate = new DateTime(2026, 10, 28)
            },
            new Transaction
            {
                AccountId = account.Id,
                CategoryId = transportationCategory.Id,
                Type = TransactionType.Expense,
                Amount = 150m,
                Description = "Jeepney",
                TransactionDate = new DateTime(2026, 10, 28)
            },
            new Transaction
            {
                AccountId = account.Id,
                CategoryId = transportationCategory.Id,
                Type = TransactionType.Expense,
                Amount = 100m,
                Description = "Bus",
                TransactionDate = new DateTime(2026, 10, 28)
            },
            new Transaction
            {
                AccountId = account.Id,
                CategoryId = salaryCategory.Id,
                Type = TransactionType.Income,
                Amount = 10000m,
                Description = "Monthly Salary",
                TransactionDate = new DateTime(2026, 10, 28)
            },
            new Transaction
            {
                AccountId = account.Id,
                CategoryId = foodCategory.Id,
                Type = TransactionType.Expense,
                Amount = 5000m,
                Description = "Deleted Food Purchase",
                TransactionDate = new DateTime(2026, 10, 28),
                IsDeleted = true
            }
        };

        context.Transactions.AddRange(transactions);

        await context.SaveChangesAsync();

        // Act
        var financeService = new FinanceService(context);

        var result = await financeService.GetExpensesByCategoryAsync(
            null,
            null
        );

        // Assert
        Assert.Equal(2, result.Count);

        var food = Assert.Single(result, x => x.CategoryName == "Food");
        var transportation = Assert.Single(result, x => x.CategoryName == "Transportation");

        Assert.Equal(800m, food.TotalAmount);
        Assert.Equal(250m, transportation.TotalAmount);
    }

    [Fact]
    public async Task GetMonthlyTrendsAsync_ShouldReturnAllTwelveMonths()
    {
        // Arrange
        var (connection, context) = await CreateTestDatabaseAsync();

        using var dbConnection = connection;
        using var dbContext = context;

        // Act
        var financeService = new FinanceService(context);

        var result = await financeService.GetMonthlyTrendsAsync(2026);

        // Assert
        Assert.Equal(12, result.Count);

        for (int month = 1; month <= 12; month++)
        {
            var monthlyTrend = Assert.Single(result, x => x.Month == month);

            Assert.Equal(2026, monthlyTrend.Year);
            Assert.Equal(0m, monthlyTrend.TotalIncome);
            Assert.Equal(0m, monthlyTrend.TotalExpenses);
            Assert.Equal(0m, monthlyTrend.NetCashFlow);
        }
    }

    [Fact]
    public async Task GetMonthlyTrendsAsync_ShouldCalculateMonthlyTotals()
    {
        // Arrange
        var (connection, context) = await CreateTestDatabaseAsync();
        using var dbConnection = connection;
        using var dbContext = context;

        var account = new Account
        {
            Name = "Monthly Trends Wallet",
            InitialBalance = 0m
        };

        context.Accounts.Add(account);

        await context.SaveChangesAsync();

        var incomeCategory = new Category
        {
            Name = "Salary",
            Type = TransactionType.Income
        };
        var expenseCategory = new Category
        {
            Name = "Food",
            Type = TransactionType.Expense
        };

        context.Categories.AddRange(incomeCategory, expenseCategory);

        await context.SaveChangesAsync();

        var transactions = new List<Transaction>
        {
            new Transaction
            {
                AccountId = account.Id,
                CategoryId = incomeCategory.Id,
                Type = TransactionType.Income,
                Amount = 10000m,
                Description = "January Salary",
                TransactionDate = new DateTime(2026, 1, 10)
            },
            new Transaction
            {
                AccountId = account.Id,
                CategoryId = expenseCategory.Id,
                Type = TransactionType.Expense,
                Amount = 3000m,
                Description = "January Food",
                TransactionDate = new DateTime(2026, 1, 15)
            },
            new Transaction
            {
                AccountId = account.Id,
                CategoryId = incomeCategory.Id,
                Type = TransactionType.Income,
                Amount = 15000m,
                Description = "February Salary",
                TransactionDate = new DateTime(2026, 2, 10)
            },
            new Transaction
            {
                AccountId = account.Id,
                CategoryId = expenseCategory.Id,
                Type = TransactionType.Expense,
                Amount = 5000m,
                Description = "February Food",
                TransactionDate = new DateTime(2026, 2, 15)
            },
            new Transaction
            {
                AccountId = account.Id,
                CategoryId = incomeCategory.Id,
                Type = TransactionType.Income,
                Amount = 50000m,
                Description = "December 2025 Salary",
                TransactionDate = new DateTime(2025, 12, 15)
            },
            new Transaction
            {
                AccountId = account.Id,
                CategoryId = expenseCategory.Id,
                Type = TransactionType.Expense,
                Amount = 9000m,
                Description = "Deleted January Expense",
                TransactionDate = new DateTime(2026, 1, 20),
                IsDeleted = true
            },
        };

        context.Transactions.AddRange(transactions);

        await context.SaveChangesAsync();

        // Act
        var financeService = new FinanceService(context);

        var result = await financeService.GetMonthlyTrendsAsync(2026);

        // Assert
        Assert.Equal(12, result.Count);

        for (int month = 1; month <= 12; month++)
        {
            var monthlyTrend = Assert.Single(result, x => x.Month == month);

            Assert.Equal(2026, monthlyTrend.Year);

            if (month == 1)
            {
                Assert.Equal(10000m, monthlyTrend.TotalIncome);
                Assert.Equal(3000m, monthlyTrend.TotalExpenses);
                Assert.Equal(7000m, monthlyTrend.NetCashFlow);
            }
            else if (month == 2)
            {
                Assert.Equal(15000m, monthlyTrend.TotalIncome);
                Assert.Equal(5000m, monthlyTrend.TotalExpenses);
                Assert.Equal(10000m, monthlyTrend.NetCashFlow);
            }
            else
            {
                Assert.Equal(0m, monthlyTrend.TotalIncome);
                Assert.Equal(0m, monthlyTrend.TotalExpenses);
                Assert.Equal(0m, monthlyTrend.NetCashFlow);
            }
        }
    }

    [Fact]
    public async Task GetDashboardAsync_ShouldReturnCompleteDashboard()
    {
        // Arrange
        var (connection, context) = await CreateTestDatabaseAsync();

        using var dbConnection = connection;
        using var dbContext = context;

        // Act
        var financeService = new FinanceService(context);

        var result = await financeService.GetDashboardAsync(2026);

        // Assert
        Assert.NotNull(result);

        Assert.Equal(0m, result.Summary.TotalIncome);
        Assert.Equal(0m, result.Summary.TotalExpenses);
        Assert.Equal(0m, result.Summary.NetCashFlow);
        Assert.Equal(0m, result.Summary.CombinedBalance);

        Assert.Empty(result.ExpensesByCategory);

        Assert.Equal(12, result.MonthlyTrends.Count);
    }

    [Fact]
    public async Task GetDashboardAsync_ShouldReturnConsistentFinancialData()
    {
        // Arrange
        var (connection, context) = await CreateTestDatabaseAsync();

        using var dbConnection = connection;
        using var dbContext = context;

        var account = new Account
        {
            Name = "Dashboard Test Wallet",
            InitialBalance = 5000m
        };

        context.Accounts.Add(account);

        await context.SaveChangesAsync();

        var incomeCategory = new Category
        {
            Name = "Salary",
            Type = TransactionType.Income
        };
        var expenseCategory = new Category
        {
            Name = "Food",
            Type = TransactionType.Expense
        };

        context.Categories.AddRange(incomeCategory, expenseCategory);

        await context.SaveChangesAsync();

        var transactions = new List<Transaction>
        {
            new Transaction
            {
                AccountId = account.Id,
                CategoryId = incomeCategory.Id,
                Type = TransactionType.Income,
                Amount = 10000m,
                Description = "January Salary",
                TransactionDate = new DateTime(2026, 1, 10)
            },
            new Transaction
            {
                AccountId = account.Id,
                CategoryId = expenseCategory.Id,
                Type = TransactionType.Expense,
                Amount = 2000m,
                Description = "January Food",
                TransactionDate = new DateTime(2026, 1, 15)
            }
        };

        context.Transactions.AddRange(transactions);

        await context.SaveChangesAsync();

        // Act
        var financeService = new FinanceService(context);

        var result = await financeService.GetDashboardAsync(2026);

        // Assert
        Assert.NotNull(result);

        Assert.Equal(10000m, result.Summary.TotalIncome);
        Assert.Equal(2000m, result.Summary.TotalExpenses);
        Assert.Equal(8000m, result.Summary.NetCashFlow);
        Assert.Equal(13000m, result.Summary.CombinedBalance);

        // Expense check
        var foodExpense = Assert.Single(result.ExpensesByCategory);

        Assert.Equal("Food", foodExpense.CategoryName);
        Assert.Equal(2000m, foodExpense.TotalAmount);
        Assert.Equal(expenseCategory.Id, foodExpense.CategoryId);

        // Monthly trends check
        var monthlyTrends = result.MonthlyTrends;

        Assert.Equal(12, monthlyTrends.Count);

        for (int month = 1; month <= 12; month++)
        {
            var monthlyTrend = Assert.Single(monthlyTrends, x => x.Month == month);

            Assert.Equal(2026, monthlyTrend.Year);

            if (month == 1)
            {
                Assert.Equal(10000m, monthlyTrend.TotalIncome);
                Assert.Equal(2000m, monthlyTrend.TotalExpenses);
                Assert.Equal(8000m, monthlyTrend.NetCashFlow);
            }
            else
            {
                Assert.Equal(0m, monthlyTrend.TotalIncome);
                Assert.Equal(0m, monthlyTrend.TotalExpenses);
                Assert.Equal(0m, monthlyTrend.NetCashFlow);
            }
        }
    }

    private static async Task<(SqliteConnection Connection, SabiDbContext Context)>
    CreateTestDatabaseAsync()
    {
        var connection = new SqliteConnection("Data Source=:memory:");

        await connection.OpenAsync();

        var options = new DbContextOptionsBuilder<SabiDbContext>()
            .UseSqlite(connection)
            .Options;

        var context = new SabiDbContext(options);

        await context.Database.EnsureCreatedAsync();

        return (connection, context);
    }
}