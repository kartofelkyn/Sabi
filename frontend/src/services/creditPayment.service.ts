import { apiGet, apiPost, apiPut, apiDelete } from "@/lib/api";
import type { CreateCreditPaymentDto } from "@/types/creditPayment/CreateCreditPaymentDto";
import type { CreditPaymentResponseDto } from "@/types/creditPayment/CreditPaymentResponseDto";
import type { EditCreditPaymentDto } from "@/types/creditPayment/EditCreditPaymentDto";

const ENDPOINT = "CreditPayments";

export async function getCreditPayment(id: number): Promise<CreditPaymentResponseDto> {
    return apiGet<CreditPaymentResponseDto>(`${ENDPOINT}/${id}`);
}
export async function createCreditPayment(
    data: CreateCreditPaymentDto
): Promise<CreditPaymentResponseDto> {
    return apiPost<CreditPaymentResponseDto>(`${ENDPOINT}`, data);
}

export async function updateCreditPayment(
    id: number,
    data: EditCreditPaymentDto
): Promise<CreditPaymentResponseDto> {
    return apiPut<CreditPaymentResponseDto>(`${ENDPOINT}/${id}`, data);
}

export async function deleteCreditPayment(
    id: number
): Promise<void> {
    return apiDelete(`${ENDPOINT}/${id}`);
}