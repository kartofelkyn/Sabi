
export interface CategoryBreakdown {
    id: number;
    name: string;
    type: number;
    description: string;
    icon: string;
    transactionCount: number;
}

export interface CategorySummary {
    totalCategories: number;
    totalIncomeCategories: number;
    totalExpenseCategories: number;
    categories: CategoryBreakdown[];
}