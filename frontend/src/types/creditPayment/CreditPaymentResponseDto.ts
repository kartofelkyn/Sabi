export interface CreditPaymentResponseDto {
    id: number,
    sourceAccountId: number,
    creditAccountId: number,
    amount: number,
    description: string,
    paymentDate: string
}