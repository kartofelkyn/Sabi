import { apiGet } from "@/lib/api";
import type { FinanceSummary } from "@/types/finance/FinanceSummary";
import type { FinanceDashboard } from "@/types/finance/FinanceDashboard";

export async function getFinanceSummary(): Promise<FinanceSummary> 
{
    return apiGet<FinanceSummary>('Finance/Summary');
}

export async function getFinanceDashboard(
  year: number
): Promise<FinanceDashboard> {
  return apiGet<FinanceDashboard>(`Finance/dashboard?year=${year}`);
}