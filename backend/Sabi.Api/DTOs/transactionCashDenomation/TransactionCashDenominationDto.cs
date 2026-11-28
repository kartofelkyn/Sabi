using System.ComponentModel.DataAnnotations;

namespace Sabi.Api.DTOs;

public class TransactionCashDenominationDto
{
    [Range(typeof(decimal), "0.01", "1000.00")]
    public decimal DenominationValue { get; set; }

    [Range(int.MinValue, int.MaxValue)]
    public int Quantity { get; set; }
}