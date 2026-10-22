using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Sabi.Api.Data;
using Sabi.Api.DTOs;
using Sabi.Api.Models;
using Sabi.Api.Enums;

[ApiController]
[Route("api/[controller]")]
public class TransactionsController : ControllerBase
{
    private readonly SabiDbContext _context;

    public TransactionsController(SabiDbContext context)
    {
        _context = context;
    }

    // Get: /api/transactions
    [HttpGet]
    public async Task<IActionResult> GetTransactions(
        [FromQuery] int? accountId,
        [FromQuery] int? categoryId,
        [FromQuery] TransactionType? type,
        [FromQuery] DateTime? startDate,
        [FromQuery] DateTime? endDate,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 10
    )
    {
        // Early Validation Stopper
        if ( page < 1 )
        {
            return BadRequest("Page must be greater than zero");
        }
        if ( pageSize < 1 )
        {
            return BadRequest("Page size must be greater than zero");
        }
        if ( pageSize > 100 )
        {
            return BadRequest("Page size must not exceed 100.");
        }
        if (type.HasValue && !Enum.IsDefined(type.Value))
        {
            return BadRequest("Invalid transaction type.");
        }
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
            .AsNoTracking();

        if (accountId.HasValue)
        {
            query = query.Where(t => t.AccountId == accountId.Value);
        }
        if (categoryId.HasValue)
        {
            query = query.Where(t => t.CategoryId == categoryId.Value);
        }
        if (type.HasValue)
        {
            query = query.Where(t => t.Type == type.Value);
        }
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

        int totalCount = await query.CountAsync();

        int totalPages = (int)Math.Ceiling(
            (double) totalCount / pageSize
        );
        var transactions = await query
            .OrderByDescending(t => t.TransactionDate)
            .ThenByDescending(t => t.Id)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(t => new TransactionResponseDto
            {
                Id = t.Id,
                AccountId = t.AccountId,
                CategoryId = t.CategoryId,
                Type = t.Type,
                Amount = t.Amount,
                Description = t.Description,
                TransactionDate = t.TransactionDate,
                CreatedAt = t.CreatedAt
            })
            .ToListAsync();

        var response = new PagedResponseDto<TransactionResponseDto>
        {
            Page = page,
            PageSize = pageSize,
            TotalCount = totalCount,
            TotalPages = totalPages,
            Data = transactions
        };
        
        return Ok(response);
    }

    // Get: /api/transaction/{id}
    [HttpGet("{id}")]
    public async Task<IActionResult> GetTransaction(int id)
    {
        var transaction = await _context.Transactions
            .AsNoTracking()
            .FirstOrDefaultAsync(t => t.Id == id);

        if (transaction == null)
        {
            return NotFound($"Transaction with ID {id} does not exist.");
        }

        return Ok(ToResponseDto(transaction));
    }
    // Post: /api/transactions
    [HttpPost]
    public async Task<IActionResult> CreateTransaction(
        CreateTransactionDto request
    )
    {
        // Check if the account exists
        bool accountExists = await _context.Accounts
            .AnyAsync(a => a.Id == request.AccountId);

        if (!accountExists)
        {
            return NotFound($"Account with ID {request.AccountId} does not exist.");
        }

        // Check if the category exists
        var category = await _context.Categories
            .AsNoTracking()
            .FirstOrDefaultAsync(c => c.Id == request.CategoryId);

        if (category == null)
        {
            return NotFound($"Category with ID {request.CategoryId} does not exist.");
        }
        if (category.Type != request.Type)
        {
            return BadRequest($"Category with ID {request.CategoryId} does not match the transaction type.");
        }
        if (!request.TransactionDate.HasValue)
        {
            return BadRequest("Transaction date is required.");
        }
        if (request.Amount != decimal.Round(request.Amount, 2))
        {
            return BadRequest("Amount must have at most two decimal places.");
        }

        var transaction = new Transaction
        {
            AccountId = request.AccountId,
            CategoryId = request.CategoryId,
            Type = request.Type,
            Amount = request.Amount,
            Description = request.Description?.Trim() ?? string.Empty,
            TransactionDate = request.TransactionDate.Value,
        };

        _context.Transactions.Add(transaction);
        await _context.SaveChangesAsync();

        return CreatedAtAction(
            nameof(GetTransaction),
            new { id = transaction.Id },
            ToResponseDto(transaction)
        );
    }

    // Reusable mapping
    private static TransactionResponseDto ToResponseDto(Transaction transaction)
    {
        var response = new TransactionResponseDto
        {
            Id = transaction.Id,
            AccountId = transaction.AccountId,
            CategoryId = transaction.CategoryId,
            Type = transaction.Type,
            Amount = transaction.Amount,
            Description = transaction.Description,
            TransactionDate = transaction.TransactionDate,
            CreatedAt = transaction.CreatedAt
        };
        return response;
    }
}