import { apiGet, apiPost, apiPut, apiDelete } from "@/lib/api";

import { Transaction, TransactionFilters, PagedResponse } from "@/types/transaction/Transaction";
import { EditTransactionDto } from "@/types/transaction/EditTransactionDto";
import { CreateTransactionDto } from "@/types/transaction/CreateTransactionDto";

const ENDPOINT = "transactions";

export async function getTransactions(
    filters: TransactionFilters = {}
): Promise<PagedResponse<Transaction>> {
    const params = new URLSearchParams();
    
    if (filters.accountId !== undefined) {
        params.append("accountId", filters.accountId.toString());
    }

    if (filters.categoryId !== undefined) {
        params.append("categoryId", filters.categoryId.toString());
    }

    if (filters.type !== undefined) {
        params.append("type", filters.type.toString());
    }

    if (filters.startDate) {
        params.append("startDate", filters.startDate);
    }

    if (filters.endDate) {
        params.append("endDate", filters.endDate);
    }

    params.append("page", (filters.page ?? 1).toString());
    params.append("pageSize", (filters.pageSize ?? 10).toString());

    return apiGet<PagedResponse<Transaction>>(
        `${ENDPOINT}?${params.toString()}`
    );
}

export async function getTransaction(
    id: number
): Promise<Transaction> {
    return apiGet<Transaction>(`${ENDPOINT}/${id}`);
}

export async function createTransaction(
    data: CreateTransactionDto
): Promise<Transaction> {
    return apiPost<Transaction>(ENDPOINT, data);
}

export async function updateTransaction(
    id: number,
    data: EditTransactionDto
): Promise<Transaction> {
    return apiPut<Transaction>(`${ENDPOINT}/${id}`, data);
}

export async function deleteTransaction(
    id: number
): Promise<void> {
    return apiDelete(`${ENDPOINT}/${id}`);
}