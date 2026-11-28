using System.ComponentModel.DataAnnotations;

namespace Sabi.Api.DTOs;

public class CreateCreditPaymentDto
{
    [Range(1, int.MaxValue)]
    public int SourceAccountId { get; set; }

    [Range(1, int.MaxValue)]
    public int CreditAccountId { get; set; }

    [Range(typeof(decimal), "0.01", "79228162514264337593543950335")]
    public decimal Amount { get; set; }
    [StringLength(500)]
    public string Description { get; set; } = string.Empty;

    public DateTime PaymentDate { get; set; }
}