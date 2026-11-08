using System.ComponentModel.DataAnnotations;
using Sabi.Api.Enums;
namespace Sabi.Api.DTOs;

public class CreateTransactionDto
{
    [Range(1, int.MaxValue)]
    public int AccountId { get; set; }
    [Range(1, int.MaxValue)]
    public int CategoryId { get; set; }

    [Required]
    [EnumDataType(typeof(TransactionType))]
    public TransactionType Type { get; set; }

    [Range(typeof(decimal), "0.01", "9999999999999999.99")]
    public decimal Amount { get; set; }
    [StringLength(500)]
    public string Description { get; set; } = string.Empty;
    [Required]
    public DateTime? TransactionDate { get; set; }

}