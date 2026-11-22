export interface SelectedTransactionDto {
    id: number;
    recordType: string;
    accountId: number;
    accountName: string;
    sourceAccountId: number;
    sourceAccountName: string;
    creditAccountId: number;
    creditAccountName: string;
    categoryName: string;
    transactionType: string;
    amount: number;
    description: string;
    transactionDate: string;
}