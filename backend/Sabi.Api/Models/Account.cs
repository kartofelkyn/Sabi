namespace Sabi.Api.Models
{
    public class Account
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public decimal InitialBalance { get; set; }
        public string Currency { get; set; } = "PHP";
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}