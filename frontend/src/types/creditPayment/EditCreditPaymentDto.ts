export interface EditCreditPaymentDto {
    sourceAccountId: number,
    creditAccountId: number,
    amount: number,
    description: string,
    paymentDate: string
}