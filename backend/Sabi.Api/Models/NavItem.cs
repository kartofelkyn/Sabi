namespace Sabi.Api.Models;

public class NavItem
{
    public int Id { get; set; }

    public int? ParentId { get; set; }

    public string Label { get; set; } = string.Empty;

    public string? Path { get; set; }

    public string Icon { get; set; } = string.Empty;

    public string Description { get; set; } = string.Empty;

    public int SortOrder { get; set; } = 0;

    public bool IsActive { get; set; } = true;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Self-referencing relationship
    public NavItem? Parent { get; set; }

    public ICollection<NavItem> Children { get; set; }
        = new List<NavItem>();
}