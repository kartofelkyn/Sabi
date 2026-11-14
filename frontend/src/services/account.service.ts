import { apiGet, apiPost, apiPut, apiDelete } from "@/lib/api";
import type { AccountSummary } from "@/types/accounts/AccountsSummary";
import type { AccountTransaction } from "@/types/accounts/AccountTransaction";
import type { CreateAccountDto } from "@/types/accounts/CreateAccountDto";
import type { AccountResponse } from "@/types/accounts/AccountResponse";
import type { EditAccountDto } from "@/types/accounts/EditAccountDto";

export async function GetAccountSummary(): Promise<AccountSummary[]> {
  return apiGet<AccountSummary[]>('Accounts/accounts-summary');
}

export async function GetAccountTransaction(
  accountId?: number
): Promise<AccountTransaction[]> {
  const url = accountId !== undefined
    ? `Accounts/account-transactions?accountId=${accountId}`
    : `Accounts/account-transactions`;

  return apiGet<AccountTransaction[]>(url);
}

export async function GetAccount(
  accountId?: number
): Promise<AccountResponse> {
  return apiGet<AccountResponse>(`Accounts/${accountId}`)
}

export async function CreateAccount(data: CreateAccountDto) {
  return apiPost<AccountResponse>("Accounts", data);
}

export async function EditAccount(
  accountId: number,
  data: EditAccountDto
) {
  return apiPut<AccountResponse>(`Accounts/${accountId}`, data);
}

export async function DeleteAccount(accountId: number): Promise<void>{
  return apiDelete(`Accounts/${accountId}`);
}