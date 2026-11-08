
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Sabi.Api.Data;
using Sabi.Api.DTOs;
using Sabi.Api.Models;
using Sabi.Api.Enums;
namespace Sabi.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AccountsController : ControllerBase
{
    private readonly SabiDbContext _context;

    public AccountsController(SabiDbContext context)
    {
        _context = context;
    }

    // GET: /api/accounts
    [HttpGet]
    public async Task<IActionResult> GetAccounts()
    {
        var accounts = await _context.Accounts
            .AsNoTracking()
            .OrderBy(a => a.Id)
            .ToListAsync();

        return Ok(accounts);
    }

    // GET: /api/accounts/1
    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetAccount(int id)
    {
        var account = await _context.Accounts
            .AsNoTracking()
            .FirstOrDefaultAsync(a => a.Id == id);

        if (account == null)
        {
            return NotFound();
        }

        return Ok(account);
    }

    // POST: /api/accounts
    [HttpPost]
    public async Task<IActionResult> CreateAccount(
        CreateAccountDto request)
    {
        if (!Enum.IsDefined(typeof(AccountType), request.Type))
        {
            return BadRequest("Invalid Account type.");
        }
        var account = new Account
        {
            Name = request.Name.Trim(),
            InitialBalance = request.InitialBalance,
            Currency = request.Currency,
            Type = request.Type,
            CreatedAt = DateTime.UtcNow
        };

        if (string.IsNullOrWhiteSpace(account.Name))
        {
            return BadRequest("Account name is required.");
        }

        _context.Accounts.Add(account);

        await _context.SaveChangesAsync();

        return CreatedAtAction(
            nameof(GetAccount),
            new { id = account.Id },
            account
        );
    }

    // PUT: /api/accounts/1
    [HttpPut("{id:int}")]
    public async Task<IActionResult> UpdateAccount(
    int id,
    UpdateAccountDto request)
    {
        if (!Enum.IsDefined(typeof(AccountType), request.Type))
        {
            return BadRequest("Invalid Account type.");
        }

        var account = await _context.Accounts
            .FindAsync(id);

        if (account == null)
        {
            return NotFound(
                new
                {
                    message = "Account not found."
                }
            );
        }

        account.Name = request.Name.Trim();
        account.InitialBalance = request.InitialBalance;
        account.Currency = request.Currency;
        account.Type = request.Type;

        if (string.IsNullOrWhiteSpace(account.Name))
        {
            return BadRequest("Account name is required.");
        }

        await _context.SaveChangesAsync();

        return Ok(account);
    }

    // Delete: /api/accounts/1
    [HttpDelete("{id:int}")]
    public async Task<IActionResult> DeleteAccount(int id)
    {
        var account = await _context.Accounts
            .FindAsync(id);

        if (account == null)
        {
            return NotFound(new
            {
                message = "Account not found."
            });
        }

        _context.Accounts.Remove(account);

        await _context.SaveChangesAsync();

        return NoContent();
    }

    // Get: /api/accounts/{id}/balance
    [HttpGet("{id}/balance")]
    public async Task<IActionResult> GetAccountBalance(int id)
    {
        var account = await _context.Accounts
            .AsNoTracking()
            .FirstOrDefaultAsync(a => a.Id == id);

        if (account == null)
        {
            return NotFound("Account does not exist");
        }

        decimal totalIncome = await _context.Transactions
            .Where(t =>
                t.AccountId == id &&
                t.Type == TransactionType.Income &&
                !t.IsDeleted
            )
            .SumAsync(t => t.Amount);

        decimal totalExpenses = await _context.Transactions
            .Where(t =>
                t.AccountId == id &&
                t.Type == TransactionType.Expense &&
                !t.IsDeleted
            )
            .SumAsync(t => t.Amount);

        decimal currentBalance = account.InitialBalance + totalIncome - totalExpenses;

        var response = new AccountBalanceDto
        {
            AccountId = account.Id,
            AccountName = account.Name,
            InitialBalance = account.InitialBalance,
            TotalIncome = totalIncome,
            TotalExpenses = totalExpenses,
            CurrentBalance = currentBalance
        };
        return Ok(response);
    }

    // Get: /api/accounts/GetAccountsSummary
    [HttpGet("accounts-summary")]
    public async Task<IActionResult> GetAccountsSummary()
    {
        var accounts = await _context.Accounts
            .Include(a => a.Transactions)
            .ToListAsync();

        var summaries = accounts.Select(account => MapToSummary(account)).ToList();

        var allAccounts = new AccountSummaryDto
        {
            AccountId = 0,
            AccountName = "All Accounts",
            TotalIncome = summaries.Sum(a => a.TotalIncome),
            TotalExpense = summaries.Sum(a => a.TotalExpense),
            Balance = summaries.Sum(a => a.Balance)
        };

        summaries.Insert(0, allAccounts);

        return Ok(summaries);
    }

    private AccountSummaryDto MapToSummary(Account account)
    {
        var initialBalance = account.InitialBalance;

        var income = account.Transactions
            .Where(t => t.Type == TransactionType.Income)
            .Sum(t => t.Amount);

        var expense = account.Transactions
            .Where(t => t.Type == TransactionType.Expense)
            .Sum(t => t.Amount);

        var balance = initialBalance + income - expense;

        var response = new AccountSummaryDto
        {
            AccountId = account.Id,
            AccountName = account.Name,
            TotalIncome = income,
            TotalExpense = expense,
            Balance = balance
        };

        return response;
    }

    // Get: /api/{id}/transactions
    [HttpGet("account-transactions")]
    public async Task<IActionResult> GetAccountTransactions
    (
        [FromQuery] int? accountId
    )
    {
        var query = _context.Transactions
            .Where(t => !t.IsDeleted)
            .AsNoTracking();

        if (accountId.HasValue)
        {
            query = query.Where(t => t.AccountId == accountId.Value);
        }

        var transactions = await query
            .OrderByDescending(t => t.TransactionDate)
            .Select(t => new AccountTransactionResponseDto
            {
                Id = t.Id,
                AccountId = t.AccountId,
                CategoryName = t.Category.Name,
                Type = t.Type.ToString(),
                Description = t.Description,
                Amount = t.Amount,
                TransactionDate = t.TransactionDate
            })
            .ToListAsync();

        return Ok(transactions);
    }
}
