
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
        var account = new Account
        {
            Name = request.Name.Trim(),
            InitialBalance = request.InitialBalance,
            Currency = request.Currency,
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

}
