using Microsoft.AspNetCore.Http.HttpResults;
using Sabi.Api.Data;
namespace Sabi.Api.Services;
using Microsoft.EntityFrameworkCore;
using Sabi.Api.Enums;
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
}