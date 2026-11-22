import type { TransactionTypeEnum } from "@/enums/transaction-type";

export interface TransactionHistory {
    id: number;
    recordType: string;
    accountId: number;
    accountName: string;
    isAccountDeleted: boolean;
    sourceAccountId: number;
    sourceAccountName: string;
    isSourceAccountDeleted: boolean;
    creditAccountId: number;
    creditAccountName: string;
    isCreditAccountDeleted: boolean;
    categoryId: number;
    categoryName: string;
    type: TransactionTypeEnum;
    amount: number;
    description: string;
    transactionDate: string;
    createdAt: string;
    cashDenomation: {
        denominationValue: number;
        quantity: number;
    }[];
}

export interface Transaction {
    id: number;
    accountId: number;
    accountName: string;
    isAccountDeleted: boolean;
    categoryId: number;
    categoryName: string;
    type: TransactionTypeEnum;
    amount: number;
    description: string;
    transactionDate: string;
    createdAt: string;
    cashDenomation: {
        denominationValue: number;
        quantity: number;
    }[];
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
