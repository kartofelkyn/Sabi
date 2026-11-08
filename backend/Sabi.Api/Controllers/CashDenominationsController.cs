using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

using Sabi.Api.Data;
using Sabi.Api.DTOs;
using Sabi.Api.Models;
using Sabi.Api.Enums;

namespace Sabi.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class CashDenominationController : ControllerBase
{
    private readonly SabiDbContext _context;

    public CashDenominationController(SabiDbContext context)
    {
        _context = context;
    }

    private static readonly decimal[] Denominations =
    {
        1000m, 500m, 200m, 100m, 50m, 20m,
        10m, 5m, 1m, 0.25m
    };

    // Get: /api/cashdenomination/{accountId}
    [HttpGet("accountId: int")]
    public async Task<IActionResult> GetCashDenominations(int accountId)
    {
        var account = await _context.Accounts
            .AsNoTracking()
            .FirstOrDefaultAsync(a=> a.Id == accountId);

        if (account == null)
        {
            return NotFound("Account not found");
        }

        if (account.Type != AccountType.PhysicalCash)
        {
            return BadRequest("Account is not a physical cash type");
        }

        var records = await _context.CashDenominations
            .AsNoTracking()
            .Where(c => c.AccountId == accountId)
            .ToListAsync();

        var denominations = Denominations.Select(value =>
        {
            var record = records.FirstOrDefault(
                c => c.DenominationValue == value
            );

            return new CashDenomationResponseDto
            {
                DenominationValue = value,
                Quantity = record?.Quantity ?? 0
            };
        }).ToList();

        var response = new CashBalanceResponseDto
        {
            AccountId = account.Id,
            AccountName = account.Name,
            Denominations = denominations,
            totalPhysicalCash = denominations.Sum(
                d => d.DenominationValue * d.Quantity
            )
        };

        return Ok(response);
    }

    // PUT: /api/cashdenominations/1
    [HttpPut("{accountId:int}")]
    public async Task<IActionResult> UpdateCashDenominations(
        int accountId,
        [FromBody] List<UpdateCashDenominationDto> request)
    {
        var account = await _context.Accounts
            .FirstOrDefaultAsync(a => a.Id == accountId);

        if (account == null)
            return NotFound("Account not found.");

        if (account.Type != AccountType.PhysicalCash)
            return BadRequest("Account is not a cash account.");

        if (request == null)
            return BadRequest("Request is required.");

        if (request.Any(d => d.Quantity < 0))
            return BadRequest("Quantity cannot be negative.");

        if (request.Any(d =>
            !Denominations.Contains(d.DenominationValue)))
        {
            return BadRequest("Invalid denomination.");
        }

        if (request.GroupBy(d => d.DenominationValue)
            .Any(g => g.Count() > 1))
        {
            return BadRequest("Duplicate denominations are not allowed.");
        }

        var existingRecords = await _context.CashDenominations
            .Where(c => c.AccountId == accountId)
            .ToListAsync();

        // Update or insert submitted denominations
        foreach (var item in request)
        {
            var existing = existingRecords.FirstOrDefault(
                c => c.DenominationValue == item.DenominationValue
            );

            if (item.Quantity == 0)
            {
                if (existing != null)
                    _context.CashDenominations.Remove(existing);

                continue;
            }

            if (existing == null)
            {
                _context.CashDenominations.Add(
                    new CashDenomination
                    {
                        AccountId = accountId,
                        DenominationValue = item.DenominationValue,
                        Quantity = item.Quantity
                    }
                );
            }
            else
            {
                existing.Quantity = item.Quantity;
            }
        }

        await _context.SaveChangesAsync();

        return Ok(new
        {
            message = "Cash denominations updated successfully."
        });
    }
}