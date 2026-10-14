using System.ComponentModel.DataAnnotations;
using Sabi.Api.Enums;

namespace Sabi.Api.DTOs;

public class CreateCategoryDto
{
    [Required]
    [StringLength(100, MinimumLength = 1)]
    public string Name { get; set; } = string.Empty;

    [Required]
    [EnumDataType(typeof(TransactionType))]
    public TransactionType Type { get; set; }
    
}