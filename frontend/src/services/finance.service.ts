import { apiGet } from "@/lib/api";
import type { FinanceSummary } from "@/types/finance/FinanceSummary";

export async function getFinanceSummary(): Promise<FinanceSummary> 
{
    return apiGet<FinanceSummary>('Finance/Summary');
}