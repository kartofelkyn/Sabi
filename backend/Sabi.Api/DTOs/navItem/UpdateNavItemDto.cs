using System.ComponentModel.DataAnnotations;

namespace Sabi.Api.DTOs;

public class UpdateNavItemDto
{
    public int? ParentId { get; set; }
    
    [Required]
    public string Label { get; set; } = string.Empty;

    public string? Path { get; set; }

    public string Icon { get; set; } = string.Empty;

    public string Description { get; set; } = string.Empty;
    
    [Range(0, int.MaxValue)]
    public int SortOrder { get; set; } = 0;
}