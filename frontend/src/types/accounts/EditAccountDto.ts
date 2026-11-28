import type { AccountType } from "../../enums/AccountType";

export interface EditAccountDto {
    name: string;
    initialBalance: number;
    currency: string;
    type: AccountType;
}