using Sabi.Api.Enums;
namespace Sabi.Api.DTOs;

public class AccountTransactionResponseDto
{
    public int Id { get; set; }
    public int AccountId { get; set; }
    public string CategoryName { get; set; } = string.Empty;
    public string Type { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    public string Description { get; set; } = string.Empty;
    public DateTime TransactionDate { get; set; }
}