import type { AccountType } from "./AccountType";

export interface CreateAccountDto {
    name: string;
    initialBalance: number;
    currency: string;
    type: AccountType;
}