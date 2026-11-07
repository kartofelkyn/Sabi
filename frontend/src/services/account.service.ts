import { apiGet } from "@/lib/api";
import type { AccountSummary } from "@/types/accounts/AccountsSummary"; 
import type { AccountTransaction } from "@/types/accounts/AccountTransaction";

export async function GetAccountSummary() : Promise<AccountSummary[]>
{
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