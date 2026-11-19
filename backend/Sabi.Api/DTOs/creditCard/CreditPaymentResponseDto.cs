
namespace Sabi.Api.DTOs;

public class CreditPaymentResponseDto
{
    public int Id { get; set; }
    public int SourceAccountId { get; set; }

    public int CreditAccountId { get; set; }

    public decimal Amount { get; set; }
    public string Description { get; set; } = string.Empty;
    public DateTime PaymentDate { get; set; }
    public DateTime CreatedAt { get; set; }
}