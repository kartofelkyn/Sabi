import { apiGet, apiPost, apiPut, apiDelete } from "@/lib/api";

import type { CategorySummary } from "@/types/category/CategorySummary";
import type { CategoryDetails } from "@/types/category/CategoryDetail";
import type { CreateCategoryDto } from "@/types/category/CreateCategoryDto";
import type { EditCategoryDto } from "@/types/category/EditCategoryDto";
import type { CategoryResponse } from "@/types/category/CategoryResponse";

export async function GetCategorySummary(
    type?: number
): Promise<CategorySummary>{
    const url = type !== undefined
        ? `Categories/categories-summary?type=${type}`
        : `Categories/categories-summary`
    return apiGet<CategorySummary>(url);
}

export async function GetCategoryDetails(
    categoryId: number
): Promise<CategoryDetails>{
    return apiGet<CategoryDetails>(`Categories/category-detail/${categoryId}`);
}

export async function CreateCategory(
    data: CreateCategoryDto
){
    return apiPost<CategoryResponse>(`Categories`, data);
}

export async function UpdateCategory(
    categoryId: number,
    data: EditCategoryDto
){
    return apiPut<CategoryResponse>(`Categories/${categoryId}`, data);
}

export async function DeleteCategory(categoryId: number): Promise<void>{
    return apiDelete(`Categories/${categoryId}`);
}