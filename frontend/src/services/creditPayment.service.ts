import { apiGet, apiPost, apiPut, apiDelete } from "@/lib/api";
import type { CreateCreditPaymentDto } from "@/types/creditPayment/CreateCreditPaymentDto";
import type { CreditPaymentResponseDto } from "@/types/creditPayment/CreditPaymentResponseDto";

export async function createCreditPayment(
    data: CreateCreditPaymentDto
): Promise<CreditPaymentResponseDto> {
    return apiPost<CreditPaymentResponseDto>("CreditPayments", data);
}