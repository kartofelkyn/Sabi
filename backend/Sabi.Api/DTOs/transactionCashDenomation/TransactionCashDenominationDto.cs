using System.ComponentModel.DataAnnotations;

namespace Sabi.Api.DTOs;

public class TransactionCashDenominationDto
{
    [Range(typeof(decimal), "0.01", "1000.00")]
    public decimal DenominationValue { get; set; }

    [Range(1, int.MaxValue)]
    public int Quantity { get; set; }
}