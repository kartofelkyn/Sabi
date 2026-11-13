using Sabi.Api.DTOs;

public class CashBalanceResponseDto
{
    public int AccountId { get; set; }
    public string AccountName { get; set; } = string.Empty;
    public List<CashDenomationResponseDto> Denominations { get; set; } = new();
    public decimal totalPhysicalCash { get; set; }
}