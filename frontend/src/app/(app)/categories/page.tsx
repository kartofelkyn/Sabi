"use client";

import { useEffect, useState } from "react";
import { FileChartColumnIncreasing, BanknoteArrowDown, BanknoteArrowUp, Plus, Eye, Trash, Pencil } from 'lucide-react';
import { DynamicIcon } from "lucide-react/dynamic";
import SearchBar from '@/components/common/SearchBar';
import Dropdown from '@/components/common/Dropdown';
import { transactionTypeOptions } from "@/constants/transactions/transaction-type-options";

import { GetCategorySummary, GetCategoryDetails, CreateCategory, UpdateCategory, DeleteCategory } from "@/services/category.service";
import AddCategoryModal from "@/components/category/AddCategoryModal";
import ViewCategoryModal from "@/components/category/ViewCategoryModal";
import EditCategoryModal from "@/components/category/EditCategoryModal";
import DeleteCategoryModal from "@/components/category/DeleteCategoryModal";

import type { CategoryBreakdown } from "@/types/category/CategorySummary";
import type { CreateCategoryDto } from "@/types/category/CreateCategoryDto";
import type { EditCategoryDto } from "@/types/category/EditCategoryDto";
import type { CategoryDetails } from "@/types/category/CategoryDetail";

export default function CategoriesPage() {
  // Data
  const [categoriesList, setCategoryList] = useState<CategoryBreakdown[]>([]);
  const [isCategoriesLoading, setIsCategoriesLoading] = useState(false);
  const [categoriesError, setCategoriesError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [categoriesTotal, setCategoriesTotal] = useState<number>(0);
  const [incomeCategoriesTotal, setIncomeCategoriesTotal] = useState<number>(0);
  const [expenseCategoriesTotal, setExpenseCategoriesTotal] = useState<number>(0);

  // Filter
  const [search, setSearch] = useState("");
  const [transactionType, setTransactionType] = useState<number | null>(null);

  // Modal
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // Load categories
  useEffect(() => {
    let isActive = true;

    async function loadCategories() {
      try {
        setIsCategoriesLoading(true);
        setCategoriesError(null);

        const data = await GetCategorySummary();

        if (isActive) {
          setCategoryList(data.categories);
          setCategoriesTotal(data.totalCategories);
          setIncomeCategoriesTotal(data.totalIncomeCategories);
          setExpenseCategoriesTotal(data.totalExpenseCategories);
        }
      } catch (categoriesError) {
        if (isActive) {
          setCategoriesError(
            categoriesError instanceof Error
              ? categoriesError.message
              : "Failed to load categories."
          )
        }
      } finally {
        if (isActive) {
          setIsCategoriesLoading(false);
        }
      }
    }

    loadCategories();

    return () => {
      isActive = false;
    }
  }, [])

  async function refreshCategory() {
    const updatedCategory = await GetCategorySummary();

    setCategoryList(updatedCategory.categories);
    setCategoriesTotal(updatedCategory.totalCategories);
    setIncomeCategoriesTotal(updatedCategory.totalIncomeCategories);
    setExpenseCategoriesTotal(updatedCategory.totalExpenseCategories);
  }
  async function handleCreateCategory(data: CreateCategoryDto) {
    await CreateCategory(data);

    refreshCategory();
  }

  async function handleEditCategory(data: EditCategoryDto) {
    if (selectedCategory === null || selectedCategory < 0) return;

    await UpdateCategory(selectedCategory, data);

    refreshCategory();
  }

  async function handleRemoveCategory() {
    if (selectedCategory === null || selectedCategory < 0) return;

    await DeleteCategory(selectedCategory);

    refreshCategory();
  }
  return (
    <div className="main-categories-page w-full h-full min-h-0 flex flex-col gap-8 overflow-hidden">
      <header className="min-h-22 w-full grid grid-cols-[1fr_1fr] gap-4">
        <div className="bg-card p-3 w-full h-full flex flex-row items-center gap-4 rounded-md border-l-3 border-primary">
          <div className="bg-card-secondary p-4 rounded-full text-muted-foreground">
            <FileChartColumnIncreasing size={30} />
          </div>
          <div >
            <div className="flex flex-col justify-center">
              <span className="text-lg text-foreground font-bold">
                Category
              </span>
              <span className="text-base text-muted-foreground font-semibold">
                Total Category: {categoriesTotal ?? 0}
              </span>
              <span className="text-xs text-muted-foreground">
                Add, edit, delete Categories.
              </span>
            </div>
          </div>
        </div>
        <div className="flex flex-row w-full h-full gap-5">
          <div className="bg-card p-3 w-full h-full flex flex-row items-center gap-4 border-l-3 border-income rounded-md">
            <div className="bg-card-secondary p-2.5 rounded-full text-muted-foreground">
              <BanknoteArrowUp size={40} />
            </div>
            <div >
              <div className="flex flex-col justify-center">
                <span className="text-lg text-foreground font-bold">
                  Income
                </span>
                <span className="text-base text-muted-foreground font-semibold">
                  {incomeCategoriesTotal ?? 0}
                </span>
                <span className="text-xs text-muted-foreground">
                  Out of {categoriesTotal ?? 0} categories
                </span>
              </div>
            </div>
          </div>
          <div className="bg-card p-3 w-full h-full flex flex-row items-center gap-4 border-l-3 border-expenses rounded-md">
            <div className="bg-card-secondary p-2.5 rounded-full text-muted-foreground">
              <BanknoteArrowDown size={40} />
            </div>
            <div >
              <div className="flex flex-col justify-center">
                <span className="text-lg text-foreground font-bold">
                  Expense
                </span>
                <span className="text-base text-muted-foreground font-semibold">
                  {expenseCategoriesTotal ?? 0}
                </span>
                <span className="text-xs text-muted-foreground">
                  Out of {categoriesTotal ?? 0} categories
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>
      <section className="bg-card w-full flex-1 min-h-0 border border-border flex flex-col overflow-hidden">
        <div className='w-full flex flex-row py-3 px-6 items-center min-h-20 border-b-2 border-border justify-between gap-2 '>
          <div className="flex flex-row gap-4">
            <SearchBar
              className='w-120 h-10'
              placeholder='Search category'
              value={search}
              onChange={setSearch}
            />
          </div>
          <div className="flex flex-row gap-4">
            <Dropdown
              id="transaction-type"
              name="transactionType"
              value={transactionType}
              onChange={setTransactionType}
              placeholder="All Types"
              options={transactionTypeOptions}
            />
            <button
              title="Add Transaction"
              className="
              bg-primary px-2 border border-border rounded-md h-10 min-w-20 flex flex-row items-center gap-2
              text-primary-foreground text-base font-semibold
              transition-colors duration-150

              hover:bg-primary/90
              active:bg-primary/80

              focus-visible:outline-none
              focus-visible:ring-2
              focus-visible:ring-ring
              focus-visible:ring-offset-2
              focus-visible:ring-offset-background

              disabled:pointer-events-none
              disabled:opacity-50"
              onClick={() => setIsAddModalOpen(true)}

            >
              <Plus />
              <span>
                Add Category
              </span>
            </button>
          </div>

        </div>
        <div className="w-full flex-1 min-h-0 overflow-y-auto">
          {isCategoriesLoading && (
            <p className="px-4 py-10 text-center text-sm text-muted-foreground">
              Categories Loading...
            </p>
          )}
          {categoriesError && (
            <p className="px-4 py-10 text-center text-sm text-muted-foreground">
              Unable to load categories.
            </p>
          )}
          {categoriesList.length === 0 && (
            <p className="px-4 py-10 text-center text-sm text-muted-foreground">
              No categories found.
            </p>
          )}
          {categoriesList.map((category, index) => {
            const isIncome = category.type === 1;

            return (
              <div
                key={category.id}
                className={`
                group w-full min-h-22 px-5 py-3
                flex items-center justify-between gap-4
                border-b border-border
                transition-colors duration-200
                hover:bg-card-hover
                ${index % 2 === 0
                    ? "bg-account-card-1"
                    : "bg-account-card-2"
                  }
              `}
              >
                <div className="flex items-center gap-4 min-w-0">
                  <div className={`
                    rounded-xl p-3 shrink-0
                    ${isIncome
                      ? "bg-income/10 text-income"
                      : "bg-expense/10 text-expense"
                    }
                  `}>
                    <DynamicIcon
                      name={(category.icon || "file-chart-column") as React.ComponentProps<typeof DynamicIcon>["name"]}
                      size={24}
                    />
                  </div>

                  <div className="flex flex-col min-w-0">
                    <span className="text-base font-semibold text-foreground truncate">
                      {category.name ?? "Unknown"}
                    </span>
                    <span className="text-sm text-muted-foreground truncate">
                      {category.description || "No description"}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-6 shrink-0">
                  <div className="flex flex-col items-end gap-1">
                    <span className={`
                      text-sm font-semibold
                      ${isIncome ? "text-income" : "text-expense"}
                    `}>
                      {isIncome ? "Income" : "Expense"}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {category.transactionCount ?? 0} transactions
                    </span>
                  </div>

                  <div className="
                    flex items-center
                    border-l border-border pl-4
                  ">
                    <button
                      title="View category"
                      className="p-2 rounded-md hover:bg-primary/10 text-primary/50 hover:text-foreground"
                      onClick={() => {
                        setIsViewModalOpen(true);
                        setSelectedCategory(category.id);
                      }}
                    >
                      <Eye size={17} />
                    </button>

                    <button
                      title="Edit category"
                      className="p-2 rounded-md hover:bg-primary/10 text-primary/50 hover:text-primary"
                      onClick={() => {
                        setIsEditModalOpen(true);
                        setSelectedCategory(category.id);
                      }}
                    >
                      <Pencil size={17} />
                    </button>

                    <button
                      title="Delete category"
                      className="p-2 rounded-md hover:bg-primary/10 text-primary/50 hover:text-expense"
                      onClick={() => {
                        setIsDeleteModalOpen(true);
                        setSelectedCategory(category.id);
                      }}
                    >
                      <Trash size={17} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>
      <AddCategoryModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={handleCreateCategory}
      />
      <ViewCategoryModal
        selectedCategory={selectedCategory ?? null}
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
      />
      <EditCategoryModal
        selectedCategory={selectedCategory}
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSubmit={handleEditCategory}
      />
      <DeleteCategoryModal
        selectedCategory={selectedCategory}
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onDelete={handleRemoveCategory}
      />
    </div>
  )
}