using System.ComponentModel.DataAnnotations;

namespace Sabi.Api.DTOs;

public class UpdateAccountDto
{
    [Required]
    [StringLength(100, MinimumLength = 1)]
    public string Name { get; set; } = string.Empty;

    [Range(typeof(decimal), "0", "79228162514264337593543950335")]
    public decimal InitialBalance { get; set; }

    [Required]
    [RegularExpression("^[A-Z]{3}$")]
    public string Currency { get; set; } = "PHP";
}