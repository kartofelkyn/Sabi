
namespace Sabi.Api.Models;

public class CreditPayment
{
    public int Id { get; set; }

    public int SourceAccountId { get; set; }
    public Account SourceAccount { get; set; } = null!;

    public int CreditAccountId { get; set; }
    public Account CreditAccount { get; set; } = null!;

    public decimal Amount { get; set; }

    public string Description { get; set; } = string.Empty;

    public DateTime PaymentDate { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public bool IsDeleted { get; set; } = false;
    public DateTime? DeletedAt { get; set; }
}
