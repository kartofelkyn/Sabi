
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Sabi.Api.Data;
using Sabi.Api.DTOs;
using Sabi.Api.Enums;
using Sabi.Api.Models;

namespace Sabi.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class CreditPaymentsController : ControllerBase
{
    private readonly SabiDbContext _context;

    public CreditPaymentsController(SabiDbContext context)
    {
        _context = context;
    }

    // GET: api/CreditPayments
    [HttpGet]
    public async Task<IActionResult> GetCreditPayments()
    {
        var creditPayments = await _context.CreditPayments
            .AsNoTracking()
            .Where(c => !c.IsDeleted)
            .OrderBy(c => c.Id)
            .ToListAsync();

        var response = creditPayments.Select(ToResponseDto);

        return Ok(response);
    }

    // GET: api/CreditPayments/{id}
    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetCreditPayment(int id)
    {
        var creditPayment = await _context.CreditPayments
            .AsNoTracking()
            .FirstOrDefaultAsync(c => c.Id == id && !c.IsDeleted);

        if (creditPayment == null)
        {
            return NotFound("Credit payment not found.");
        }

        return Ok(ToResponseDto(creditPayment));
    }

    // POST: api/CreditPayments
    [HttpPost]
    public async Task<IActionResult> CreateCreditPayment(
        CreateCreditPaymentDto request
    )
    {
        if (request.SourceAccountId == request.CreditAccountId)
        {
            return BadRequest(
                "Source and destination account cannot be the same."
            );
        }

        var sourceAccount = await _context.Accounts
            .FirstOrDefaultAsync(a =>
                a.Id == request.SourceAccountId &&
                !a.IsDeleted
            );

        if (sourceAccount == null)
        {
            return NotFound("Source account not found.");
        }

        if (sourceAccount.Type == AccountType.Credit)
        {
            return BadRequest(
                "Credit accounts cannot be used as payment sources."
            );
        }

        var destinationAccount = await _context.Accounts
            .FirstOrDefaultAsync(a =>
                a.Id == request.CreditAccountId &&
                a.Type == AccountType.Credit &&
                !a.IsDeleted
            );

        if (destinationAccount == null)
        {
            return NotFound("Destination credit account not found.");
        }

        // Calculate destination credit account balance
        var totalExpenses = await _context.Transactions
            .Where(t =>
                !t.IsDeleted &&
                t.AccountId == destinationAccount.Id &&
                t.Type == TransactionType.Expense
            )
            .SumAsync(t => t.Amount);

        var totalIncome = await _context.Transactions
            .Where(t =>
                !t.IsDeleted &&
                t.AccountId == destinationAccount.Id &&
                t.Type == TransactionType.Income
            )
            .SumAsync(t => t.Amount);

        var totalPayments = await _context.CreditPayments
            .Where(c =>
                !c.IsDeleted &&
                c.CreditAccountId == destinationAccount.Id
            )
            .SumAsync(c => c.Amount);

        var outstandingBalance =
            destinationAccount.InitialBalance
            + totalExpenses
            - totalIncome
            - totalPayments;

        if (request.Amount > outstandingBalance)
        {
            return BadRequest(
                "Payment exceeds the outstanding balance."
            );
        }

        // Calculate source account balance
        var sourceTransactions = _context.Transactions
            .Where(t =>
                !t.IsDeleted &&
                t.AccountId == sourceAccount.Id
            );

        var sourceTotalIncome = await sourceTransactions
            .Where(t => t.Type == TransactionType.Income)
            .SumAsync(t => t.Amount);

        var sourceTotalExpense = await sourceTransactions
            .Where(t => t.Type == TransactionType.Expense)
            .SumAsync(t => t.Amount);

        var sourceTotalCreditPayments = await _context.CreditPayments
            .Where(c =>
                !c.IsDeleted &&
                c.SourceAccountId == sourceAccount.Id
            )
            .SumAsync(c => c.Amount);

        var currentBalance =
            sourceAccount.InitialBalance
            + sourceTotalIncome
            - sourceTotalExpense
            - sourceTotalCreditPayments;

        if (request.Amount > currentBalance)
        {
            return BadRequest(
                "Insufficient funds in source account."
            );
        }

        var creditPayment = new CreditPayment
        {
            SourceAccountId = request.SourceAccountId,
            CreditAccountId = request.CreditAccountId,
            Amount = request.Amount,
            Description = request.Description?.Trim() ?? "",
            PaymentDate = request.PaymentDate
        };

        _context.CreditPayments.Add(creditPayment);

        await _context.SaveChangesAsync();

        return CreatedAtAction(
            nameof(GetCreditPayment),
            new { id = creditPayment.Id },
            ToResponseDto(creditPayment)
        );
    }

    // PUT: api/CreditPayments/{id}
    [HttpPut("{id:int}")]
    public async Task<IActionResult> UpdateCreditPayment(
        int id,
        UpdateCreditPaymentDto request
    )
    {
        var creditPayment = await _context.CreditPayments
            .FirstOrDefaultAsync(c =>
                c.Id == id &&
                !c.IsDeleted
            );

        if (creditPayment == null)
        {
            return NotFound("Credit payment not found.");
        }

        if (request.SourceAccountId == request.CreditAccountId)
        {
            return BadRequest(
                "Source and destination account cannot be the same."
            );
        }

        var sourceAccount = await _context.Accounts
            .FirstOrDefaultAsync(a =>
                a.Id == request.SourceAccountId &&
                !a.IsDeleted
            );

        if (sourceAccount == null)
        {
            return NotFound("Source account not found.");
        }

        if (sourceAccount.Type == AccountType.Credit)
        {
            return BadRequest(
                "Credit accounts cannot be used as payment sources."
            );
        }

        var destinationAccount = await _context.Accounts
            .FirstOrDefaultAsync(a =>
                a.Id == request.CreditAccountId &&
                a.Type == AccountType.Credit &&
                !a.IsDeleted
            );

        if (destinationAccount == null)
        {
            return NotFound("Destination credit account not found.");
        }

        // Calculate destination balance, excluding the payment
        var totalExpenses = await _context.Transactions
            .Where(t =>
                !t.IsDeleted &&
                t.AccountId == destinationAccount.Id &&
                t.Type == TransactionType.Expense
            )
            .SumAsync(t => t.Amount);

        var totalIncome = await _context.Transactions
            .Where(t =>
                !t.IsDeleted &&
                t.AccountId == destinationAccount.Id &&
                t.Type == TransactionType.Income
            )
            .SumAsync(t => t.Amount);

        var totalPayments = await _context.CreditPayments
            .Where(c =>
                !c.IsDeleted &&
                c.CreditAccountId == destinationAccount.Id &&
                c.Id != creditPayment.Id
            )
            .SumAsync(c => c.Amount);

        var outstandingBalance =
            destinationAccount.InitialBalance
            + totalExpenses
            - totalIncome
            - totalPayments;

        if (request.Amount > outstandingBalance)
        {
            return BadRequest(
                "Payment exceeds the outstanding balance."
            );
        }

        // Calculate source balance, excluding the payment
        var sourceTransactions = _context.Transactions
            .Where(t =>
                !t.IsDeleted &&
                t.AccountId == sourceAccount.Id
            );

        var sourceTotalIncome = await sourceTransactions
            .Where(t => t.Type == TransactionType.Income)
            .SumAsync(t => t.Amount);

        var sourceTotalExpense = await sourceTransactions
            .Where(t => t.Type == TransactionType.Expense)
            .SumAsync(t => t.Amount);

        var sourceTotalCreditPayments = await _context.CreditPayments
            .Where(c =>
                !c.IsDeleted &&
                c.SourceAccountId == sourceAccount.Id &&
                c.Id != creditPayment.Id
            )
            .SumAsync(c => c.Amount);

        var currentBalance =
            sourceAccount.InitialBalance
            + sourceTotalIncome
            - sourceTotalExpense
            - sourceTotalCreditPayments;

        if (request.Amount > currentBalance)
        {
            return BadRequest(
                "Insufficient funds in source account."
            );
        }

        // Update the existing payment
        creditPayment.SourceAccountId = request.SourceAccountId;
        creditPayment.CreditAccountId = request.CreditAccountId;
        creditPayment.Amount = request.Amount;
        creditPayment.Description = request.Description?.Trim() ?? "";
        creditPayment.PaymentDate = request.PaymentDate;

        await _context.SaveChangesAsync();

        return Ok(ToResponseDto(creditPayment));
    }

    // DELETE: api/CreditPayments/{id}
    [HttpDelete("{id:int}")]
    public async Task<IActionResult> DeleteCreditPayment(int id)
    {
        var creditPayment = await _context.CreditPayments
            .FirstOrDefaultAsync(c =>
                c.Id == id &&
                !c.IsDeleted
            );

        if (creditPayment == null)
        {
            return NotFound("Credit payment not found.");
        }

        creditPayment.IsDeleted = true;
        creditPayment.DeletedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        return NoContent();
    }

    // Reusable mapping
    private static CreditPaymentResponseDto ToResponseDto(
        CreditPayment creditPayment
    )
    {
        return new CreditPaymentResponseDto
        {
            Id = creditPayment.Id,
            SourceAccountId = creditPayment.SourceAccountId,
            CreditAccountId = creditPayment.CreditAccountId,
            Amount = creditPayment.Amount,
            Description = creditPayment.Description,
            PaymentDate = creditPayment.PaymentDate,
            CreatedAt = creditPayment.CreatedAt
        };
    }
}
