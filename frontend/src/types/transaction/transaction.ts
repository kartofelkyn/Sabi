import type { TransactionTypeEnum } from "@/enums/transaction-type";

export interface Transaction {
    id: number;
    accountId: number;
    accountName: string;
    categoryId: number;
    categoryName: string;
    type: TransactionTypeEnum;
    amount: number;
    description: string;
    transactionDate: string;
    createdAt: string;
}

export interface UpdateTransactionDto {
    accountId: number;
    categoryId: number;
    type: TransactionTypeEnum;
    amount: number;
    description: string;
    transactionDate: string;
}

export interface TransactionFilters {
    accountId?: number;
    categoryId?: number;
    type?: TransactionTypeEnum;
    startDate?: string;
    endDate?: string;
    page?: number;
    pageSize?: number;
}

export interface PagedResponse<T> {
    page: number;
    pageSize: number;
    totalCount: number;
    totalPages: number;
    data: T[];
}
