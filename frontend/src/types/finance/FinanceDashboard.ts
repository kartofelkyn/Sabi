import type { FinanceSummary } from "./FinanceSummary";

export interface ExpenseByCategory 
{
    categoryId: number,
    categoryName: string,
    totalAmount: number
}
export interface MonthlyTrend 
{

    year: number,
    month: number,
    totalIncome: number,
    totalExpenses: number,
    netCashFlow: number
}
export interface FinanceDashboard 
{
    summary: FinanceSummary,
    expensesByCategory: ExpenseByCategory[],
    monthlyTrends: MonthlyTrend[]
}