using Microsoft.AspNetCore.Http.HttpResults;
using Sabi.Api.Data;
namespace Sabi.Api.Services;

using Microsoft.EntityFrameworkCore;
using Sabi.Api.Enums;
using Sabi.Api.DTOs;
using Sabi.Api.Models;
/*
{
  "totalCategories": 10,
  "totalIncomeCategories": 4,
  "totalExpenseCategories": 6,
  "categories": [
    {
      "id": 1,
      "name": "Food",
      "type": "Expense",
      "description": "Food and dining expenses",
      "transactionCount": 25
    },
    {
      "id": 2,
      "name": "Salary",
      "type": "Income",
      "description": "Monthly salary",
      "transactionCount": 12
    }
  ]
}
*/
public class CategoryService
{
    private readonly SabiDbContext _context;

    public CategoryService(SabiDbContext context)
    {
        _context = context;
    }

    public async Task<CategorySummaryResponseDto> GetCategoriesAsync(
        TransactionType? type
    )
    {
        var query = _context.Categories
            .AsNoTracking()
            .Where(c => !c.IsDeleted);

        var TotalCount = await query.CountAsync();

        var IncomeCount = await query.CountAsync(c => c.Type == TransactionType.Income);

        var ExpenseCount = await query.CountAsync(c => c.Type == TransactionType.Expense);

        if (type.HasValue)
        {
            query = query.Where(c => c.Type == type.Value);
        }

        var categories = await query
            .OrderBy(c => c.Id)
            .Select(c => new CategoryResponseDto
            {
                Id = c.Id,
                Name = c.Name,
                Type = c.Type,
                Description = c.Description,
                Icon = c.Icon,

                TransactionCount = _context.Transactions
                    .Count(t =>
                        t.CategoryId == c.Id &&
                        !t.IsDeleted
                    )
            })
            .ToListAsync();

        var response = new CategorySummaryResponseDto
        {
            TotalCategories = TotalCount,
            TotalIncomeCategories = IncomeCount,
            TotalExpenseCategories = ExpenseCount,
            Categories = categories
        };

        return response;
    }

    public async Task<CategoryDetailResponseDto?> GetCategoryDetailAsync(
        int id
    )
    {   
        var category = await _context.Categories
            .AsNoTracking()
            .Where(c => c.Id == id && !c.IsDeleted)
            .Select(c => new CategoryDetailResponseDto
            {
                Name = c.Name,
                Type = c.Type,
                Description = c.Description,
                Icon = c.Icon,

                TransactionCount = _context.Transactions
                    .Count(t => t.CategoryId == id && !t.IsDeleted),

                TotalAmount = _context.Transactions
                    .Where(t => t.CategoryId == id && !t.IsDeleted)
                    .Sum(t => (decimal?)t.Amount) ?? 0m
            })
            .FirstOrDefaultAsync();
        
        return category;
    }
}