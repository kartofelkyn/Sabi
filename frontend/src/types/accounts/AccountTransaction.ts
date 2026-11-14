export interface AccountTransaction{
    id: number,
    accountId: number,
    categoryName: string,
    type: string,
    amount: number,
    description: string,
    transactionDate: string,
}