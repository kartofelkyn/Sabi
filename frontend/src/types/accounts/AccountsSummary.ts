export interface AccountSummary {
    accountId: number;
    accountName: string;
    accountType: number | null;
    balance: number;
    totalIncome: number;
    totalExpense: number;
}