namespace Sabi.Api.DTOs;

public class CategorySummaryResponseDto
{
    public int TotalCategories { get; set; }
    public int TotalIncomeCategories { get; set; }
    public int TotalExpenseCategories { get; set; }

    public List<CategoryResponseDto> Categories { get; set; } = [];
}