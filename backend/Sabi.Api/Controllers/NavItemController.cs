
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Sabi.Api.Data;
using Sabi.Api.DTOs;
using Sabi.Api.Models;
using Sabi.Api.Enums;
namespace Sabi.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class NavItemController : ControllerBase
{
    private readonly SabiDbContext _context;

    public NavItemController(SabiDbContext context)
    {
        _context = context;
    }

    // Get: api/navitem
    [HttpGet]
    public async Task<IActionResult> GetNavItems()
    {
        var navItems = await _context.NavItems
            .AsNoTracking()
            .Where(n => n.IsActive)
            .OrderBy(n => n.ParentId)
            .ThenBy(n => n.SortOrder)
            .ToListAsync();

        return Ok(navItems);
    }

    // Get: api/navitem/{id}
    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetNavItemById(int id)
    {
        var navItem = await _context.NavItems
            .AsNoTracking()
            .FirstOrDefaultAsync(n => n.Id == id && n.IsActive);

        if (navItem == null)
        {
            return NotFound("Nav item not found or inactive.");
        }

        return Ok(navItem);
    }

    // Post: api/navitem
    [HttpPost]
    public async Task<IActionResult> CreateNavItem(
        CreateNavItemDto request
    )
    {
        // Verification

        if (request.ParentId.HasValue)
        {
            bool validParent = await _context.NavItems
                .AnyAsync(n =>
                    n.Id == request.ParentId.Value &&
                    n.ParentId == null &&
                    n.IsActive
                );

            if (!validParent)
            {
                return BadRequest(
                    "Parent must be an active root navigation item."
                );
            }
        }
        if (string.IsNullOrWhiteSpace(request.Label))
        {
            return BadRequest("Label is required.");
        }

        bool orderExists = await _context.NavItems
            .AnyAsync(
                n => n.ParentId == request.ParentId &&
                n.SortOrder == request.SortOrder &&
                n.IsActive
            );

        if (orderExists)
        {
            return BadRequest("Sort order already exists for this parent.");
        }

        var navItem = new NavItem
        {
            ParentId = request.ParentId,
            Label = request.Label.Trim(),
            Path = request.Path?.Trim() ?? "/",
            Icon = request.Icon?.Trim() ?? string.Empty,
            Description = request.Description?.Trim() ?? string.Empty,
            SortOrder = request.SortOrder,
            IsActive = true,
            CreatedAt = DateTime.UtcNow
        };



        _context.NavItems.Add(navItem);
        await _context.SaveChangesAsync();
        return CreatedAtAction(
            nameof(GetNavItemById),
            new { id = navItem.Id },
            navItem
        );
    }

    // Put: api/navitem/{id}
    [HttpPut("{id:int}")]
    public async Task<IActionResult> UpdateNavItem(
        int id,
        UpdateNavItemDto request
    )
    {
        if (request.ParentId == id)
        {
            return BadRequest("A nav item cannot be its own parent.");
        }

        var navItem = await _context.NavItems
            .FirstOrDefaultAsync(n => n.Id == id && n.IsActive);

        if (navItem == null)
        {
            return NotFound("Nav item not found or inactive.");
        }

        if (request.ParentId.HasValue)
        {
            bool validParent = await _context.NavItems
                .AnyAsync(n =>
                    n.Id == request.ParentId.Value &&
                    n.ParentId == null &&
                    n.IsActive
                );

            if (!validParent)
            {
                return BadRequest(
                    "Parent must be an active root navigation item."
                );
            }

            bool hasChildren = await _context.NavItems
                .AnyAsync(n => n.ParentId == id && n.IsActive);

            if (hasChildren)
            {
                return BadRequest(
                    "A navigation item with children cannot become a child."
                );
            }
        }
        if (string.IsNullOrWhiteSpace(request.Label))
        {
            return BadRequest("Label is required.");
        }

        bool orderExists = await _context.NavItems
            .AnyAsync(
                n => n.ParentId == request.ParentId &&
                n.SortOrder == request.SortOrder &&
                n.Id != id &&
                n.IsActive
            );

        if (orderExists)
        {
            return BadRequest("Sort order already exists for this parent.");
        }

        navItem.ParentId = request.ParentId;
        navItem.Label = request.Label.Trim();
        navItem.Path = request.Path?.Trim() ?? "/";
        navItem.Icon = request.Icon?.Trim() ?? string.Empty;
        navItem.Description = request.Description?.Trim() ?? string.Empty;
        navItem.SortOrder = request.SortOrder;

        await _context.SaveChangesAsync();

        return Ok(navItem);
    }

    // Soft Delete: api/navitem/{id}
    [HttpDelete("{id:int}")]
    public async Task<IActionResult> SoftDeleteNavItem(int id)
    {
        var navItem = await _context.NavItems
            .FirstOrDefaultAsync(n => n.Id == id && n.IsActive);


        if (navItem == null)
        {
            return NotFound("Nav item not found or inactive.");
        }

        bool hasChildren = await _context.NavItems
           .AnyAsync(n => n.ParentId == id && n.IsActive);

        if (hasChildren)
        {
            return Conflict(
                "Cannot delete a navigation item with active children."
            );
        }

        navItem.IsActive = false;
        await _context.SaveChangesAsync();

        return Ok(navItem);
    }

}