import type { AccountType } from "../../enums/AccountType";

export interface AccountResponse {
    id: number;
    name: string;
    initialBalance: number;
    type: AccountType;
    currency: string;
    createdAt: string;
}