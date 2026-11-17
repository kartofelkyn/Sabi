export interface EditTransactionDto {
  accountId: number;
  categoryId: number;
  type: number;
  amount: number;
  description: string;
  transactionDate: string;
  cashDenomation: {
    denominationValue: number;
    quantity: number;
  }[];
}