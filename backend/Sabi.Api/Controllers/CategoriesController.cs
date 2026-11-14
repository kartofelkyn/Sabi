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

    [HttpGet]
    public async Task<IActionResult> GetCategories(
        [FromQuery] TransactionType? type)
    {
        IQueryable<Category> query = _context.Categories
            .AsNoTracking()
            .Where(c => !c.IsDeleted);

        if (type.HasValue)
        {
            if (!Enum.IsDefined(typeof(TransactionType), type.Value))
            {
                return BadRequest("Invalid transaction type.");
            }

            query = query.Where(c => c.Type == type.Value && !c.IsDeleted);

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
            .FirstOrDefaultAsync(c => c.Id == id && !c.IsDeleted);

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
                c.Type == request.Type &&
                !c.IsDeleted
            );

        if (categoryExists)
        {
            return Conflict("Category with the same name and type already exists.");
        }

        // Create a new category
        var category = new Category
        {
            Name = normalizedName,
            Type = request.Type,
            Description = request.Description?.Trim() ?? string.Empty,
            Icon = request.Icon?.Trim() ?? string.Empty,
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

    // Put: /api/categories/{id}
    [HttpPut("{id:int}")]
    public async Task<IActionResult> UpdateCategory(
        int id,
        UpdateCategoryDto request
    )
    {
        if (!Enum.IsDefined(typeof(TransactionType), request.Type))
        {
            return BadRequest("Invadid category type.");
        }

        var category = await _context.Categories
            .FirstOrDefaultAsync(c => c.Id == id && !c.IsDeleted);

        if (category == null)
        {
            return NotFound("Category not found.");
        }

        if (string.IsNullOrWhiteSpace(request.Name)){
            return BadRequest("Category name is required.");
        }
        
        var categoryExist = await _context.Categories
            .AnyAsync(c => 
                c.Name.ToLower() == request.Name.Trim().ToLower() && 
                c.Id != id &&
                c.Type == request.Type &&
                !c.IsDeleted
            );

        if (categoryExist)
        {
            return BadRequest("Category with the same name and type already exists.");
        }

        category.Name = request.Name.Trim();
        category.Description = request.Description?.Trim() ?? string.Empty;
        category.Icon = request.Icon?.Trim() ?? string.Empty;
        category.Type = request.Type;

        await _context.SaveChangesAsync();

        return Ok(category);
    }

    // Soft Delete: /api/categories/{id}
    [HttpDelete("{id:int}")]
    public async Task<IActionResult> DeleteCategory( int id )
    {
        var category = await _context.Categories
            .FirstOrDefaultAsync(c => c.Id == id && !c.IsDeleted);

        if (category == null)
        {
            return NotFound($"Category does not exist");
        }

        category.IsDeleted = true;
        category.DeletedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        return NoContent();
    }

}
