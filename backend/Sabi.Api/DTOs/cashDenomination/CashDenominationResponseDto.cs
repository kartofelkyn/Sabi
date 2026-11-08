using System.ComponentModel.DataAnnotations;

namespace Sabi.Api.DTOs;
public class CashDenomationResponseDto{
    [Required]
    [Range(typeof(decimal), "0", "79228162514264337593543950335", ErrorMessage = "Value must be between 0 and Decimal.MaxValue")]
    public decimal DenominationValue  { get; set; }

    [Range(int.MinValue, int.MaxValue)]
    public int Quantity { get; set; }

    public decimal Subtotal => DenominationValue  * Quantity;
}