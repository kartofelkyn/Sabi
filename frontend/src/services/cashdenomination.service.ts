import { apiGet } from "@/lib/api";
import { CashDenominationsResponseDto } from "@/types/cashDenomination/cashDenominationResponseDto";

const ENDPOINT = "CashDenomination";

export async function GetAccountCashDenomination(
  accountId?: number
): Promise<CashDenominationsResponseDto> {
  return apiGet<CashDenominationsResponseDto>(`${ENDPOINT}/${accountId}`)
}
