import { apiGet } from "@/lib/api";

import type {
    AccountsDropdown,
    CategoriesDropdown,
} from "@/types/common/dropdown";

export async function getAccountsDropdown(): Promise<AccountsDropdown[]> 
{
    return apiGet<AccountsDropdown[]>('Accounts');
}

export async function getCategoriesDropdown(): Promise<CategoriesDropdown[]> 
{
    return apiGet<CategoriesDropdown[]>('Categories');
}
