using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Sabi.Api.Data;
using Sabi.Api.DTOs;
using Sabi.Api.Enums;
using Sabi.Api.Models;
using Sabi.Api.Services;

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

    // POST: api/CreditPayment
    [HttpPost]
    public async Task<IActionResult CreateCreditPayment(
        CreateCreditPaymentDto request
    )
    {
        if (request.SourceAccountId == request.CreditAccountId)
        {
            return BadRequest("Source and destination account cannot be the same");
        }

        var sourceAccount = await _context.Accounts
            .FirstOrDefaultAsync(a => a.Id == request.SourceAccountId && !a.IsDeleted);

        if (sourceAccount == null)
        {
            return NotFound("Source account not found");
        }

        if (sourceAccount.Type == AccountType.Credit)
        {
            return BadRequest("Credit accounts cannot be used as payment sources.");
        }

        var destinationAccount = await _context.Accounts
            .FirstOrDefaultAsync(a =>
                a.Id == request.CreditAccountId &&
                a.Type == AccountType.Credit &&
                !a.IsDeleted
            );

        if (destinationAccount == null)
        {
            return NotFound("Destination account not found");
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

        return Ok(
            creditPayment
        );
    }
}