namespace Sabi.Api.Models;

public class CashDenomination
{
    public int Id { get; set; }
    public int AccountId { get; set; }
    public decimal DenominationValue { get; set; }
    public int Quantity { get; set; }
    public Account Account { get; set; } = null!;
}