export interface CreateCreditPaymentDto {
    sourceAccountId: number,
    creditAccountId: number,
    amount: number,
    description: string,
    paymentDate: string
}