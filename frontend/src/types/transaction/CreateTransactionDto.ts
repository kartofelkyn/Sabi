export interface CreateTransactionDto {
  accountId: number;
  categoryId: number;
  type: number;
  amount: number;
  description: string;
  transactionDate: string;
}