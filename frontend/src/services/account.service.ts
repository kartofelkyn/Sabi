import { apiGet } from "@/lib/api";
import type { AccountSummary } from "@/types/accounts/AccountsSummary"; 

export async function GetAccountSummary() : Promise<AccountSummary[]>
{
    return apiGet<AccountSummary[]>('Accounts/accounts-summary');
}