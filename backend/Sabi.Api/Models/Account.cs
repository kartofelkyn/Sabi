using Sabi.Api.Enums;

namespace Sabi.Api.Models
{
    public class Account
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public decimal InitialBalance { get; set; }
        public AccountType Type { get; set; }
        public string Currency { get; set; } = "PHP";
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public bool IsDeleted { get; set; } = false;
        public DateTime? DeletedAt { get; set; }
        public ICollection<Transaction> Transactions { get; set; }
            = new List<Transaction>();
        public ICollection<CashDenomination> CashDenominations { get; set; }
            = new List<CashDenomination>();
    }
}