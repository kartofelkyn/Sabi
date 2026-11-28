import { TransactionTypeEnum } from "@/enums/transaction-type";

export const transactionTypeOptions = [
    { id: TransactionTypeEnum.Income, name: "Income" },
    { id: TransactionTypeEnum.Expense, name: "Expense" },
    { id: TransactionTypeEnum.Credit, name: "Credit"}
];

export type TransactionTypeName = "Income" | "Expense" | "Credit";