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
        if (page < 1)
        {
            return BadRequest("Page must be greater than zero");
        }
        if (pageSize < 1)
        {
            return BadRequest("Page size must be greater than zero");
        }
        if (pageSize > 100)
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
            .Where(t => t.IsDeleted == false)
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
            (double)totalCount / pageSize
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
                AccountName = t.Account.Name,
                CategoryId = t.CategoryId,
                CategoryName = t.Category.Name,
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
            .Include(t => t.Account)
            .Include(t => t.Category)
            .AsNoTracking()
            .FirstOrDefaultAsync(t => t.Id == id && !t.IsDeleted);

        if (transaction == null)
        {
            return NotFound($"Transaction does not exist.");
        }

        return Ok(ToResponseDto(transaction));
    }

    // Post: /api/transactions
    [HttpPost]
    public async Task<IActionResult> CreateTransaction(
        CreateTransactionDto request
    )
    {
        var account = await _context.Accounts
            .AsNoTracking()
            .FirstOrDefaultAsync(a => a.Id == request.AccountId);

        if (account == null)
        {
            return NotFound("Account does not exist.");
        }

        bool isPhysicalCash = account.Type == AccountType.PhysicalCash;

        var category = await _context.Categories
            .AsNoTracking()
            .FirstOrDefaultAsync(c => c.Id == request.CategoryId && !c.IsDeleted);

        if (category == null)
        {
            return NotFound("Category does not exist.");
        }

        if (category.Type != request.Type)
        {
            return BadRequest("Category does not match the transaction type.");
        }

        if (!request.TransactionDate.HasValue)
        {
            return BadRequest("Transaction date is required.");
        }

        if (request.Amount != decimal.Round(request.Amount, 2))
        {
            return BadRequest("Amount must have at most two decimal places.");
        }

        if (request.Amount <= 0)
        {
            return BadRequest("Amount must be greater than zero.");
        }

        if (!Enum.IsDefined(request.Type))
        {
            return BadRequest("Invalid transaction type.");
        }

        var cashDenominations = request.CashDenomation ?? new List<TransactionCashDenominationDto>();

        if (isPhysicalCash)
        {
            if (request.CashDenomation == null || !request.CashDenomation.Any())
            {
                return BadRequest("Physical Cash transactions require cash denominations.");
            }

            if (cashDenominations.Any(item => item.Quantity <= 0))
            {
                return BadRequest("Cash denomination quantities must be greater than zero.");
            }

            if (cashDenominations.Any(item => !Denominations.Contains(item.DenominationValue)))
            {
                return BadRequest("Invalid cash denomination.");
            }

            if (cashDenominations.GroupBy(item => item.DenominationValue).Any(group => group.Count() > 1))
            {
                return BadRequest("Duplicate denominations are not allowed.");
            }

            decimal total = cashDenominations.Sum(
                item => item.DenominationValue * item.Quantity
            );

            if (request.Amount != total)
            {
                return BadRequest("Amount does not match the total of the cash denominations.");
            }
        }
        else if (request.CashDenomation != null && request.CashDenomation.Any())
        {
            return BadRequest("Cash denominations can only be provided for Physical Cash accounts.");
        }

        await using var dbTransaction = await _context.Database.BeginTransactionAsync();

        try
        {
            var accountCashDenominations = new List<CashDenomination>();

            if (isPhysicalCash)
            {
                accountCashDenominations = await _context.CashDenominations
                    .Where(c => c.AccountId == request.AccountId)
                    .ToListAsync();

                if (request.Type == TransactionType.Expense)
                {
                    foreach (var item in cashDenominations)
                    {
                        var existingDenomination = accountCashDenominations
                            .FirstOrDefault(c => c.DenominationValue == item.DenominationValue);

                        if (existingDenomination == null ||
                            existingDenomination.Quantity < item.Quantity)
                        {
                            await dbTransaction.RollbackAsync();

                            return BadRequest(
                                $"Insufficient quantity for denomination {item.DenominationValue}."
                            );
                        }
                    }
                }
            }

            var transaction = new Transaction
            {
                AccountId = request.AccountId,
                Account = account,
                CategoryId = request.CategoryId,
                Category = category,
                Type = request.Type,
                Amount = request.Amount,
                Description = request.Description?.Trim() ?? string.Empty,
                TransactionDate = request.TransactionDate.Value
            };

            _context.Transactions.Add(transaction);

            await _context.SaveChangesAsync();

            if (isPhysicalCash)
            {
                var transactionDenominations = cashDenominations.Select(item =>
                    new TransactionCashDenomination
                    {
                        TransactionId = transaction.Id,
                        DenominationValue = item.DenominationValue,
                        Quantity = item.Quantity
                    }
                ).ToList();

                _context.TransactionCashDenominations.AddRange(
                    transactionDenominations
                );

                foreach (var item in cashDenominations)
                {
                    var existingDenomination = accountCashDenominations
                        .FirstOrDefault(c =>
                            c.DenominationValue == item.DenominationValue
                        );

                    if (request.Type == TransactionType.Income)
                    {
                        if (existingDenomination != null)
                        {
                            existingDenomination.Quantity += item.Quantity;
                        }
                        else
                        {
                            var newDenomination = new CashDenomination
                            {
                                AccountId = request.AccountId,
                                DenominationValue = item.DenominationValue,
                                Quantity = item.Quantity
                            };

                            _context.CashDenominations.Add(newDenomination);
                        }
                    }
                    else if (request.Type == TransactionType.Expense)
                    {
                        existingDenomination!.Quantity -= item.Quantity;
                    }
                }
            }

            await _context.SaveChangesAsync();

            await dbTransaction.CommitAsync();

            return CreatedAtAction(
                nameof(GetTransaction),
                new { id = transaction.Id },
                ToResponseDto(transaction)
            );
        }
        catch
        {
            await dbTransaction.RollbackAsync();
            throw;
        }
    }

    // Put: /api/transactions/{id}
    [HttpPut("{id:int}")]
    public async Task<IActionResult> UpdateTransaction(
        int id,
        UpdateTransactionDto request
    )
    {
        var transaction = await _context.Transactions
            .Include(t => t.TransactionCashDenominations)
            .Include(t => t.Account)
            .Include(t => t.Category)
            .FirstOrDefaultAsync(t => t.Id == id && !t.IsDeleted);

        if (transaction == null)
        {
            return NotFound("Transaction does not exist.");
        }

        var originalAccount = await _context.Accounts
            .FirstOrDefaultAsync(a => a.Id == transaction.AccountId);

        if (originalAccount == null)
        {
            return NotFound("Original account not found.");
        }

        var newAccount = await _context.Accounts
            .FirstOrDefaultAsync(a => a.Id == request.AccountId);

        if (newAccount == null)
        {
            return NotFound("New account not found.");
        }

        bool isSameAccount = originalAccount.Id == newAccount.Id;

        bool isOriginalAccountPhysical = originalAccount.Type == AccountType.PhysicalCash;
        bool isNewAccountPhysical = newAccount.Type == AccountType.PhysicalCash;

        var category = await _context.Categories
            .FirstOrDefaultAsync(c => c.Id == request.CategoryId && !c.IsDeleted);

        if (category == null)
        {
            return NotFound("Category does not exist.");
        }

        if (category.Type != request.Type)
        {
            return BadRequest("Category type does not match transaction type.");
        }

        if (!request.TransactionDate.HasValue)
        {
            return BadRequest("Transaction date is required.");
        }

        if (decimal.Round(request.Amount, 2) != request.Amount)
        {
            return BadRequest("Amount should only have 2 decimal places.");
        }

        if (request.Amount <= 0)
        {
            return BadRequest("Amount must be greater than zero.");
        }

        if (!Enum.IsDefined(request.Type))
        {
            return BadRequest("Invalid transaction type.");
        }

        var originalAccountCurrentCashDenominations = new List<CashDenomination>();
        var newCurrentCashDenominations = new List<CashDenomination>();

        if (originalAccount.Type == AccountType.PhysicalCash)
        {
            originalAccountCurrentCashDenominations = await _context.CashDenominations
                .Where(o => o.AccountId == transaction.AccountId)
                .ToListAsync();
        }
        if (newAccount.Type == AccountType.PhysicalCash)
        {
            if (isSameAccount)
            {
                newCurrentCashDenominations = originalAccountCurrentCashDenominations;
            }
            else
            {
                newCurrentCashDenominations = await _context.CashDenominations
                    .Where(o => o.AccountId == request.AccountId)
                    .ToListAsync();
            }
        }

        await using var dbTransaction =
            await _context.Database.BeginTransactionAsync();

        try
        {
            if (isOriginalAccountPhysical)
            {
                foreach (var oldCashDenomination in transaction.TransactionCashDenominations)
                {
                    var existingDenomination = originalAccountCurrentCashDenominations
                        .FirstOrDefault(e => e.DenominationValue == oldCashDenomination.DenominationValue);

                    if (transaction.Type == TransactionType.Income)
                    {
                        if (existingDenomination == null || existingDenomination.Quantity < oldCashDenomination.Quantity)
                        {
                            await dbTransaction.RollbackAsync();

                            return BadRequest(
                                    $"Insufficient quantity for denomination {oldCashDenomination.DenominationValue}."
                                );
                        }

                        existingDenomination.Quantity -= oldCashDenomination.Quantity;
                    }
                    else
                    {
                        if (existingDenomination == null)
                        {
                            var newDenomination = new CashDenomination
                            {
                                AccountId = originalAccount.Id,
                                DenominationValue = oldCashDenomination.DenominationValue,
                                Quantity = oldCashDenomination.Quantity
                            };

                            _context.CashDenominations.Add(newDenomination);
                            originalAccountCurrentCashDenominations.Add(newDenomination);
                        }
                        else
                        {
                            existingDenomination.Quantity += oldCashDenomination.Quantity;
                        }
                    }
                }
            }

            // Avoid dereference of possible null reference issues even if we already validated it before
            var cashDenominations = request.CashDenomation;

            if (isNewAccountPhysical)
            {
                if (cashDenominations == null || !cashDenominations.Any())
                {
                    await dbTransaction.RollbackAsync();

                    return BadRequest("Physical Cash transactions require cash denominations.");
                }
                if (cashDenominations.Any(item => item.Quantity <= 0))
                {
                    await dbTransaction.RollbackAsync();

                    return BadRequest("Cash denomination quantities must be greater than zero.");
                }
                if (cashDenominations.Any(item => !Denominations.Contains(item.DenominationValue)))
                {
                    await dbTransaction.RollbackAsync();

                    return BadRequest("Invalid cash denomination.");
                }
                if (cashDenominations.GroupBy(item => item.DenominationValue).Any(group => group.Count() > 1))
                {
                    await dbTransaction.RollbackAsync();

                    return BadRequest("Duplicate denominations are not allowed.");
                }

                decimal total = cashDenominations.Sum(
                    item => item.DenominationValue * item.Quantity
                );

                if (request.Amount != total)
                {
                    await dbTransaction.RollbackAsync();

                    return BadRequest("Amount does not match the total of the cash denominations.");
                }

                if (request.Type == TransactionType.Expense)
                {
                    foreach (var newCashDenomination in cashDenominations)
                    {
                        var existingDenomination = newCurrentCashDenominations
                            .FirstOrDefault(e => e.DenominationValue == newCashDenomination.DenominationValue);

                        if (existingDenomination == null || existingDenomination.Quantity < newCashDenomination.Quantity)
                        {
                            await dbTransaction.RollbackAsync();

                            return BadRequest(
                                    $"Insufficient quantity for denomination {newCashDenomination.DenominationValue}."
                                );
                        }
                    }
                }
            }
            else if (cashDenominations != null && cashDenominations.Any())
            {
                await dbTransaction.RollbackAsync();

                return BadRequest("Cash denominations can only be provided for Physical Cash accounts.");
            }

            transaction.AccountId = request.AccountId;
            transaction.Account = newAccount;
            transaction.CategoryId = request.CategoryId;
            transaction.Category = category;
            transaction.Type = request.Type;
            transaction.Amount = request.Amount;
            transaction.Description = request.Description?.Trim() ?? string.Empty;
            transaction.TransactionDate = request.TransactionDate.Value;

            _context.TransactionCashDenominations.RemoveRange(
                transaction.TransactionCashDenominations
            );

            if (isNewAccountPhysical)
            {
                foreach (var item in cashDenominations!)
                {
                    var newTransactionDenomination = new TransactionCashDenomination
                    {
                        TransactionId = transaction.Id,
                        DenominationValue = item.DenominationValue,
                        Quantity = item.Quantity
                    };

                    var existingDenomination = newCurrentCashDenominations
                        .FirstOrDefault(e => e.DenominationValue == item.DenominationValue);

                    _context.TransactionCashDenominations.Add(newTransactionDenomination);

                    if (request.Type == TransactionType.Income)
                    {
                        if (existingDenomination != null)
                        {
                            existingDenomination.Quantity += item.Quantity;
                        }
                        else
                        {
                            var newDenomination = new CashDenomination
                            {
                                AccountId = newAccount.Id,
                                DenominationValue = item.DenominationValue,
                                Quantity = item.Quantity
                            };

                            _context.CashDenominations.Add(newDenomination);
                            newCurrentCashDenominations.Add(newDenomination);
                        }
                    }
                    else
                    {
                        existingDenomination!.Quantity -= item.Quantity;
                    }
                }


            }

            await _context.SaveChangesAsync();

            await dbTransaction.CommitAsync();

            return Ok(ToResponseDto(transaction));
        }
        catch
        {
            await dbTransaction.RollbackAsync();
            throw;
        }
    }

    // Soft Delete: /api/transactions/{id}

    // Soft Delete: /api/transactions/{id}
    [HttpDelete("{id:int}")]
    public async Task<IActionResult> DeleteTransaction(int id)
    {
        var transaction = await _context.Transactions
            .Include(t => t.TransactionCashDenominations)
            .FirstOrDefaultAsync(t => t.Id == id && !t.IsDeleted);

        if (transaction == null)
        {
            return NotFound("Transaction does not exist.");
        }

        var account = await _context.Accounts
            .FirstOrDefaultAsync(a => a.Id == transaction.AccountId);

        if (account == null)
        {
            return NotFound("Account does not exist.");
        }

        await using var dbTransaction = await _context.Database.BeginTransactionAsync();

        try
        {
            if (account.Type == AccountType.PhysicalCash)
            {
                var accountCashDenominations = await _context.CashDenominations
                    .Where(c => c.AccountId == account.Id)
                    .ToListAsync();

                foreach (var item in transaction.TransactionCashDenominations)
                {
                    var existingDenomination = accountCashDenominations
                        .FirstOrDefault(c =>
                            c.DenominationValue == item.DenominationValue
                        );

                    if (transaction.Type == TransactionType.Income)
                    {
                        if (existingDenomination == null ||
                            existingDenomination.Quantity < item.Quantity)
                        {
                            await dbTransaction.RollbackAsync();

                            return BadRequest(
                                $"Cannot delete transaction. Insufficient quantity for denomination {item.DenominationValue}."
                            );
                        }

                        existingDenomination.Quantity -= item.Quantity;
                    }
                    else if (transaction.Type == TransactionType.Expense)
                    {
                        if (existingDenomination != null)
                        {
                            existingDenomination.Quantity += item.Quantity;
                        }
                        else
                        {
                            var newDenomination = new CashDenomination
                            {
                                AccountId = account.Id,
                                DenominationValue = item.DenominationValue,
                                Quantity = item.Quantity
                            };

                            _context.CashDenominations.Add(newDenomination);
                            accountCashDenominations.Add(newDenomination);
                        }
                    }
                }
            }

            transaction.IsDeleted = true;
            transaction.DeletedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            await dbTransaction.CommitAsync();

            return NoContent();
        }
        catch
        {
            await dbTransaction.RollbackAsync();
            throw;
        }
    }


    // Reusable mapping
    private static TransactionResponseDto ToResponseDto(Transaction transaction)
    {
        var response = new TransactionResponseDto
        {
            Id = transaction.Id,
            AccountId = transaction.AccountId,
            AccountName = transaction.Account?.Name ?? string.Empty,
            CategoryId = transaction.CategoryId,
            CategoryName = transaction.Category?.Name ?? string.Empty,
            Type = transaction.Type,
            Amount = transaction.Amount,
            Description = transaction.Description,
            TransactionDate = transaction.TransactionDate,
            CreatedAt = transaction.CreatedAt
        };
        return response;
    }

    // Valid cash denomation
    private static readonly decimal[] Denominations =
    {
        1000m, 500m, 200m, 100m, 50m, 20m,
        10m, 5m, 1m, 0.25m
    };
}