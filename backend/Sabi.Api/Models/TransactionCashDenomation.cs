namespace Sabi.Api.Models;

public class TransactionCashDenomination
{
    public int Id { get; set; }
    public int TransactionId { get; set; }
    public decimal DenominationValue { get; set; }
    public int Quantity { get; set; }
    public Transaction Transaction { get; set; } = null!;
}