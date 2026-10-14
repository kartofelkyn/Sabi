using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Sabi.Api.Data;
using Sabi.Api.DTOs;
using Sabi.Api.Models;
using Sabi.Api.Enums;

[ApiController]
[Route("api/[controller]")]
public class CategoriesController : ControllerBase
{
    private readonly SabiDbContext _context;
    public CategoriesController(SabiDbContext context)
    {
        _context = context;
    }

    // Get: /api/categories
    /*
    [HttpGet]
    public async Task<IActionResult> GetCategories()
    {
        var categories = await _context.Categories
            .AsNoTracking()
            .OrderBy(c => c.Id)
            .ToListAsync();

        return Ok(categories);
    }
    */
    [HttpGet]
    public async Task<IActionResult> GetCategories(
        [FromQuery] TransactionType? type)
    {
        IQueryable<Category> query = _context.Categories
            .AsNoTracking();

        if (type.HasValue)
        {
            if (!Enum.IsDefined(typeof(TransactionType), type.Value))
            {
                return BadRequest("Invalid transaction type.");
            }

            query = query.Where(c => c.Type == type.Value);

        }

        var categories = await query
            .OrderBy(c => c.Id)
            .ToListAsync();

        return Ok(categories);
    }

    // Get: /api/categories/1
    
    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetCategory(int id)
    {
        var category = await _context.Categories
            .AsNoTracking()
            .FirstOrDefaultAsync(c => c.Id == id);

        if (category == null)
        {
            return NotFound();
        }

        return Ok(category);
    }

    // POST: /api/categories
    [HttpPost]
    public async Task<IActionResult> CreateCategory(
        CreateCategoryDto request
    )
    {
        // Checker
        if (string.IsNullOrWhiteSpace(request.Name))
        {
            return BadRequest("Category name cannot be empty.");
        }
        if (!Enum.IsDefined(request.Type))
        {
            return BadRequest("Invalid category type.");
        }

        string normalizedName = request.Name.Trim().ToLower();

        bool categoryExists = await _context.Categories
            .AnyAsync(c =>
            c.Name.ToLower() == normalizedName &&
            c.Type == request.Type);

        if (categoryExists)
        {
            return Conflict("Category with the same name and type already exists.");
        }



        // Create a new category
        var category = new Category
        {
            Name = normalizedName,
            Type = request.Type,
            CreatedAt = DateTime.UtcNow
        };

        _context.Categories.Add(category);
        await _context.SaveChangesAsync();

        return CreatedAtAction(
            nameof(GetCategory),
            new { id = category.Id },
            category
        );
    }

}