namespace Sabi.Api.DTOs;

public class AccountBalanceDto
{
    public int AccountId { get; set; }

    public string AccountName { get; set; } = string.Empty;
    
    public decimal InitialBalance { get; set; }
    public decimal TotalIncome { get; set; }
    public decimal TotalExpenses { get;  set; }
    public decimal CurrentBalance { get; set; }
}