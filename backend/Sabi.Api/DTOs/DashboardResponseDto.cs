using Sabi.Api.DTOs;

namespace Sabi.Api.DTO;

public class DashboardResponseDto
{
    public FinancialSummaryDto Summary { get; set; } = new();
    public List<CategoryExpenseDto> ExpensesByCategory { get; set; } = new();
    public List<MonthlyTrendDto> MonthlyTrends { get; set; } = new();

}