import type { AccountType } from "../../enums/AccountType";

export interface CreateAccountDto {
    name: string;
    initialBalance: number;
    currency: string;
    type: AccountType;
}