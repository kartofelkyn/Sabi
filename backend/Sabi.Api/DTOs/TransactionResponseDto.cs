using Sabi.Api.Enums;
namespace Sabi.Api.DTOs;

public class TransactionResponseDto
{
    public int Id { get; set;}
    public int AccountId { get; set; }
    public int CategoryId { get; set; }

    public TransactionType Type { get; set; }

    public decimal Amount { get; set; }

    public string Description { get; set; } = string.Empty;
    public DateTime TransactionDate { get; set; }
    public DateTime CreatedAt { get; set; }
}