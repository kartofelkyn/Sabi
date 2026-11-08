import type { AccountType } from "./AccountType";

export interface EditAccountDto {
    name: string;
    initialBalance: number;
    currency: string;
    type: AccountType;
}