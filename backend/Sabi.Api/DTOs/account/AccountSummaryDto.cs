using Sabi.Api.Enums;

namespace Sabi.Api.DTOs;
public class AccountSummaryDto
{
    public int AccountId { get; set; }
    public string AccountName { get; set; } = string.Empty;
    public AccountType? AccountType { get; set; }
    public decimal TotalIncome { get; set; }
    public decimal TotalExpense { get; set; }
    public decimal Balance { get; set; }
}