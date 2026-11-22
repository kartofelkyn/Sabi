namespace Sabi.Api.DTOs;

public class TransactionHistoryResponseDto
{
    public int Id { get; set; }

    // Transaction or CreditPayment
    public string RecordType { get; set; } = string.Empty;

    // Income, Expense, or Credit
    public string Type { get; set; } = string.Empty;

    public decimal Amount { get; set; }

    public string Description { get; set; } = string.Empty;

    public DateTime TransactionDate { get; set; }

    // Ordinary transaction
    public int? AccountId { get; set; }
    public string? AccountName { get; set; }
    public bool IsAccountDeleted { get; set; }

    public int? CategoryId { get; set; }
    public string? CategoryName { get; set; }

    // Credit payment
    public int? SourceAccountId { get; set; }
    public string? SourceAccountName { get; set; }
    public bool IsSourceAccountDeleted { get; set; }

    public int? CreditAccountId { get; set; }
    public string? CreditAccountName { get; set; }
    public bool IsCreditAccountDeleted { get; set; }
}