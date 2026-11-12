"use client";

import { useEffect, useState } from "react";
import StatCard from "@/components/transactions/StatCard";
import SearchBar from "@/components/common/SearchBar";
import Dropdown from "@/components/common/Dropdown";
import AddTransactionModal from "@/components/transactions/AddTransactionModal";
import DateRangePicker from "@/components/common/DateRangePicker";
import { transactionTypeOptions } from "@/constants/transactions/transaction-type-options";

import type { DateRange } from "react-day-picker";
import type { Transaction } from "@/types/transaction/Transaction";
import type { CreateTransactionDto } from "@/types/transaction/CreateTransactionDto";
import type { AccountsDropdown, CategoriesDropdown } from "@/types/common/dropdown";

import { getTransactions, createTransaction } from "@/services/transaction.service";
import { getFinanceSummary } from "@/services/finance.service";
import { getAccountsDropdown, getCategoriesDropdown } from "@/services/common/dropdown.service";
import {
  Edit,
  Trash,
  Plus,
  ChevronRight,
  ChevronLeft
} from "lucide-react";

export default function TransactionsPage() {
  const [accountOptions, setAccountOptions] = useState<AccountsDropdown[] | null>(null);
  const [categoryOptions, setCategoryOptions] = useState<CategoriesDropdown[] | null>(null);
  const [accountDropdownLoading, setAccountDropdownLoading] = useState(true);
  const [categoryDropdownLoading, setCategoryDropdownLoading] = useState(true);
  const [accountDropdownError, setAccountDropdownError] = useState<string | null>(null);
  const [categoryDropdownError, setCategoryDropdownError] = useState<string | null>(null);

  const [income, setIncome] = useState(0);
  const [expenses, setExpenses] = useState(0);
  const [netCash, setNetCash] = useState(0);
  const [financeSummaryLoading, setFinanceSummaryLoading] = useState(true);
  const [financeSummaryError, setFinanceSummaryError] = useState<string | null>(null);
  // Data
  const [transactionList, setTransactionList] = useState<Transaction[]>([]);
  const [isTransactionLoading, setIsTransactionLoading] = useState(false);
  const [transactionError, setTransactionError] = useState<string | null>(null);

  // Filter
  const [search, setSearch] = useState("");
  const [accountId, setAccountId] = useState<number | null>(null);
  const [categoryId, setCategoryId] = useState<number | null>(null);
  const [transactionType, setTransactionType] = useState<number | null>(null);

  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const startDate = dateRange?.from;
  const endDate = dateRange?.to ?? (
    dateRange?.from ? new Date() : undefined
  );

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  // Modal
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-PH", {
      style: "currency",
      currency: "PHP",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  }

  const formatDate = (value: string) =>
    new Date(value).toLocaleDateString("en-PH", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });

  useEffect(() => {
    let isActive = true;

    async function loadAccountsData() {
      try {
        setAccountDropdownLoading(true);
        setAccountDropdownError(null);

        const data = await getAccountsDropdown();

        if (isActive) {
          setAccountOptions(data);
        }
      } catch (error) {
        if (isActive) {
          setAccountDropdownError(
            error instanceof Error
              ? error.message
              : "Unable to fetch accounts."
          )
        }
      } finally {
        if (isActive) {
          setAccountDropdownLoading(false);
        }
      }
    }

    loadAccountsData();

    return () => {
      isActive = false;
    };
  }, []);

  useEffect(() => {
    let isActive = true;

    async function loadCategoryData() {
      try {
        setCategoryDropdownLoading(true);
        setCategoryDropdownError(null);

        const data = await getCategoriesDropdown();

        if (isActive) {
          setCategoryOptions(data);
        }
      } catch (error) {
        if (isActive) {
          setCategoryDropdownError(
            error instanceof Error
              ? error.message
              : "Unable to fetch accounts."
          )
        }
      } finally {
        if (isActive) {
          setCategoryDropdownLoading(false);
        }
      }
    }

    loadCategoryData();

    return () => {
      isActive = false;
    };
  }, []);

  useEffect(() => {
    let isActive = true;

    async function loadFinanceSummary() {
      try {
        setFinanceSummaryLoading(true);
        setFinanceSummaryError(null);

        const data = await getFinanceSummary();

        if (isActive) {
          setIncome(data.totalIncome);
          setExpenses(data.totalExpenses);
          setNetCash(data.netCashFlow);
        }
      } catch (error) {
        if (isActive) {
          setFinanceSummaryError(
            error instanceof Error
              ? error.message
              : "Unable to fetch accounts."
          )
        }
      } finally {
        if (isActive) {
          setFinanceSummaryLoading(false);
        }
      }
    }

    loadFinanceSummary();

    return () => {
      isActive = false;
    };
  }, []);

  // Fetch Transaction
  useEffect(() => {
    let isActive = true;

    async function loadTransactions() {
      try {
        setIsTransactionLoading(true);
        setTransactionError(null);

        const data = await getTransactions({
          accountId: accountId ?? undefined,
          categoryId: categoryId ?? undefined,
          type: transactionType ?? undefined,
          startDate: startDate?.toISOString(),
          endDate: endDate?.toISOString(),
          page: currentPage,
          pageSize
        })

        if (isActive) {
          setTransactionList(data.data);
          setTotalCount(data.totalCount);
          setTotalPages(data.totalPages);
        }
      } catch (transactionError) {
        if (isActive) {
          setTransactionError(
            transactionError instanceof Error
              ? transactionError.message
              : "Failed to load transactions."
          )
        }
      } finally {
        if (isActive) {
          setIsTransactionLoading(false);
        }
      }
    }

    loadTransactions();

    return () => {
      isActive = false;
    }
  }, [
    accountId,
    categoryId,
    transactionType,
    startDate,
    endDate,
    currentPage,
    pageSize
  ])

  // Reset page if filtered
  const handleAccountChange = (value: number | null) => {
    setAccountId(value);
    setCurrentPage(1);
  };

  const handleCategoryChange = (value: number | null) => {
    setCategoryId(value);
    setCurrentPage(1);
  };

  const handleTypeChange = (value: number | null) => {
    setTransactionType(value);
    setCurrentPage(1);
  };

  const handleDateChange = (range: DateRange | undefined) => {
    setDateRange(range);
    setCurrentPage(1);
  };

  async function handleCreateTransaction(data: CreateTransactionDto) {
    
    console.log("data: ", data);

    await createTransaction(data);

    const updatedTransactions = await getTransactions({
      accountId: accountId ?? undefined,
      categoryId: categoryId ?? undefined,
      type: transactionType ?? undefined,
      startDate: startDate?.toISOString(),
      endDate: endDate?.toISOString(),
      page: currentPage,
      pageSize
    })

    setTransactionList(updatedTransactions.data);
    setTotalCount(updatedTransactions.totalCount);
    setTotalPages(updatedTransactions.totalPages);
  }

  return (
    <div className="main-dashboard-page w-full h-full flex flex-col gap-6">
      <header className="bg-card flex p-3 flex-col justify-center gap-3 min-h-22 border border-border rounded-md">
        <div className="header flex flex-row justify-between">
          <div className="flex flex-col">
            <h3 className="text-lg text-foreground font-bold">
              Transaction List
            </h3>
            <p className="text-sm text-muted-foreground">
              Manage and track all your financial activities.
            </p>
          </div>
          <div className="flex flex-row gap-3">
            <StatCard
              label="Transactions"
              value={
                isTransactionLoading
                  ? "Loading..."
                  : transactionError
                    ? "Error"
                    : totalCount.toLocaleString()
              }
              className="bg-card-secondary"
            />
            <StatCard
              label="Total Income"
              value={
                financeSummaryLoading
                  ? "Loading..."
                  : financeSummaryError
                    ? "Error"
                    : formatCurrency(income).toLocaleString()
              }
              className="bg-income/65"
            />
            <StatCard
              label="Total Expenses"
              value={
                financeSummaryLoading
                  ? "Loading..."
                  : financeSummaryError
                    ? "Error"
                    : formatCurrency(expenses).toLocaleString()
              }
              className="bg-expense/65"
            />
            <StatCard
              label="Net Cash"
              value={
                financeSummaryLoading
                  ? "Loading..."
                  : financeSummaryError
                    ? "Error"
                    : formatCurrency(netCash).toLocaleString()
              }
              className="bg-primary/65"
            />
          </div>

        </div>
      </header>
      <section className="main-table bg-card/80 flex-1 min-h-0 flex flex-col border border-border rounded-md">
        <div className="w-full flex flex-row py-3 px-6 items-center min-h-20 border-b-2 border-border justify-between gap-2">
          <SearchBar
            className="w-70 h-10"
            placeholder="Search transactions"
            value={search}
            onChange={setSearch}
          />
          <Dropdown
            id="transaction-account"
            name="accountId"
            value={accountId}
            onChange={handleAccountChange}
            placeholder="All Accounts"
            options={accountOptions ?? []}
            disabled={accountDropdownLoading || !!accountDropdownError}
          />
          <Dropdown
            id="transaction-category"
            name="categoryId"
            value={categoryId}
            onChange={handleCategoryChange}
            placeholder="All Categories"
            options={categoryOptions ?? []}
            disabled={categoryDropdownLoading || !!categoryDropdownError} />
          <Dropdown
            id="transaction-type"
            name="transactionType"
            value={transactionType}
            onChange={handleTypeChange}
            placeholder="All Types"
            options={transactionTypeOptions}
          />
          <DateRangePicker
            value={dateRange}
            onChange={handleDateChange}
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
              Add Transactions
            </span>
          </button>
        </div>
        <div className="w-full flex-1 min-h-0 overflow-auto">
          <table className="w-full text-left border-collapse">
            <colgroup>
              <col className="w-[10%]" />
              <col className="w-[15%]" />
              <col className="w-[15%]" />
              <col className="w-[20%]" />
              <col className="w-[10%]" />
              <col className="w-[15%]" />
              <col className="w-[15%]" />
            </colgroup>

            <thead>
              <tr>
                {[
                  "Action",
                  "Account",
                  "Category",
                  "Description",
                  "Type",
                  "Transaction Date",
                ].map((h) => (
                  <th
                    key={h}
                    className="sticky top-0 z-10 bg-card-secondary border-b border-border px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground"
                  >
                    {h}
                  </th>
                ))}
                <th
                  className="sticky top-0 z-10 bg-card-secondary border-b border-border px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-muted-foreground"
                >
                  Amount
                </th>
              </tr>
            </thead>
            <tbody>
              {isTransactionLoading ? (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-sm text-muted-foreground">
                    Loading transactions...
                  </td>
                </tr>
              ) : transactionError ? (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-sm text-expense">
                    {transactionError}
                  </td>
                </tr>
              ) : transactionList.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-sm text-muted-foreground">
                    No transactions yet.
                  </td>
                </tr>
              ) : (
                transactionList.map((transaction, index) => {
                  const rowColor =
                    index % 2 === 0
                      ? "bg-transaction-card-1 text-transaction-card-1-foreground"
                      : "bg-transaction-card-2 text-transaction-card-2-foreground";

                  const isIncome = transaction.type === 1;

                  return (
                    <tr
                      key={transaction.id}
                      className={`${rowColor} hover:bg-transaction-card-hover border-b border-border last:border-b-0 transition-colors`}
                    >
                      <td className="text-muted-foreground px-4 py-3 flex flex-row gap-3 items-center text-sm truncate">
                        <button className="hover:text-primary/60">
                          <Edit size={17} />

                        </button>
                        <button className="hover:text-primary/60">
                          <Trash size={17} />
                        </button>
                      </td>
                      <td className="px-4 py-3 text-sm truncate">
                        {transaction.accountName}
                      </td>
                      <td className="px-4 py-3 text-sm truncate">
                        {transaction.categoryName}
                      </td>
                      <td className="px-4 py-3 text-sm truncate">
                        {transaction.description || "-"}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <span className={`font-medium ${isIncome ? "text-income" : "text-expense"}`}>
                          {transaction.type}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-muted-foreground whitespace-nowrap">
                        {formatDate(transaction.transactionDate)}
                      </td>
                      <td
                        className={`px-4 py-3 text-sm font-semibold text-right whitespace-nowrap tabular-nums ${isIncome ? "text-income" : "text-expense"
                          }`}
                      >
                        {isIncome ? "+" : "-"}
                        {formatCurrency(transaction.amount)}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        <footer className="mt-auto shrink-0 flex flex-row items-center justify-between gap-4 px-6 py-3 border-t border-border bg-card rounded-b-md">          <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span>
            Showing
            <span className="font-semibold text-foreground mx-1">
              {totalCount === 0 ? 0 : (currentPage - 1) * pageSize + 1}
            </span>
            to
            <span className="font-semibold text-foreground mx-1">
              {Math.min(currentPage * pageSize, totalCount)}
            </span>
            of
            <span className="font-semibold text-foreground mx-1">
              {totalCount}
            </span>
            results
          </span>
        </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground whitespace-nowrap">
                Rows per page
              </span>

              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="h-8 rounded-md border border-border bg-background px-2 text-xs text-foreground outline-none focus:ring-2 focus:ring-ring"
              >
                {[5, 10, 20, 50].map((size) => (
                  <option key={size} value={size}>
                    {size}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(prev => prev - 1)}
                className="h-8 w-8 flex items-center justify-center rounded-md border border-border text-foreground hover:bg-card-hover disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                aria-label="Previous page"
              >
                <ChevronLeft size={16} />
              </button>
              {Array.from({ length: totalPages }, (_, index) => index + 1)
                .map((page) => (
                  <button
                    key={page}
                    type="button"
                    onClick={() => setCurrentPage(page)}
                    className={`h-8 min-w-8 px-2 rounded-md text-xs font-medium transition-colors ${currentPage === page
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-card-hover hover:text-foreground"
                      }`}
                  >
                    {page}
                  </button>
                ))}

              <button
                type="button"
                disabled={currentPage === totalPages || totalPages === 0}
                onClick={() => setCurrentPage(prev => prev + 1)}
                className="h-8 w-8 flex items-center justify-center rounded-md border border-border text-foreground hover:bg-card-hover disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                aria-label="Next page"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </footer>
      </section>
      <AddTransactionModal
        accounts={accountOptions ?? []}
        categories={categoryOptions ?? []}
        type={transactionTypeOptions ?? []}
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={handleCreateTransaction}
      />
    </div>
  )
}