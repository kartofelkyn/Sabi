export interface CashDenominationDto {
    denominationValue: number;
    quantity: number;
    subtotal: number;
}

export interface CashDenominationsResponseDto {
    accountId: number;
    accountName: string;
    denominations: CashDenominationDto[];
}