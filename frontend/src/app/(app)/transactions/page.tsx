"use client";

import { useEffect, useState } from "react";
import StatCard from "@/components/transactions/StatCard";
import SearchBar from "@/components/common/SearchBar";
import Dropdown from "@/components/common/Dropdown";
import DateRangePicker from "@/components/common/DateRangePicker";
import { transactionTypeOptions } from "@/constants/transactions/transaction-type-options";
import type { DateRange } from "react-day-picker";
import type { AccountTransaction } from "@/types/accounts/AccountTransaction";
import type {
  AccountsDropdown,
  CategoriesDropdown,
} from "@/types/common/dropdown";
import {
  getAccountsDropdown,
  getCategoriesDropdown
} from "@/services/common/dropdown.service";
import {
  Edit,
  Trash,
  Plus
} from "lucide-react";
import { th } from "react-day-picker/locale";


export default function TransactionsPage() {
  const [accountOptions, setAccountOptions] = useState<AccountsDropdown[] | null>(null);
  const [categoryOptions, setCategoryOptions] = useState<CategoriesDropdown[] | null>(null);
  const [accountDropdownLoading, setAccountDropdownLoading] = useState(true);
  const [categoryDropdownLoading, setCategoryDropdownLoading] = useState(true);
  const [accountDropdownError, setAccountDropdownError] = useState<string | null>(null);
  const [categoryDropdownError, setCategoryDropdownError] = useState<string | null>(null);

  // Data
  const [transactionList, setTransactionList] = useState<AccountTransaction[]>([]);
  const [isTransactionLoading, setIsTransactionLoading] = useState(false);
  const [transactionError, setTransactionError] = useState<string | null>(null);

  // Filter
  const [search, setSearch] = useState(""); const [account, setAccount] = useState<number | null>(null);
  const [category, setCategory] = useState<number | null>(null);
  const [transactionType, setTransactionType] = useState<number | null>(null);

  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const startDate = dateRange?.from;
  const endDate = dateRange?.to ?? (
    dateRange?.from ? new Date() : undefined
  );

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

  const sampleTransactions = [
    {
      id: 1,
      accountName: "BDO Savings",
      categoryName: "Salary",
      description: "Monthly salary",
      type: "Income",
      transactionDate: "2026-11-05",
      amount: 25000,
    },
    {
      id: 2,
      accountName: "GCash",
      categoryName: "Food & Dining",
      description: "Lunch with friends",
      type: "Expense",
      transactionDate: "2026-11-08",
      amount: 450,
    },
    {
      id: 3,
      accountName: "BPI Savings",
      categoryName: "Transportation",
      description: "Grab ride going home",
      type: "Expense",
      transactionDate: "2026-11-10",
      amount: 280,
    },
  ];

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
              value="15"
              className="bg-card-secondary"
            />
            <StatCard
              label="Total Income"
              value="₱ 15,000.00"
              className="bg-income/65"
            />
            <StatCard
              label="Total Expenses"
              value="₱ 10,000.00"
              className="bg-expense/65"
            />
            <StatCard
              label="Net Cash"
              value="₱ 5,000.00"
              className="bg-primary/65"
            />
          </div>

        </div>
      </header>
      <section className="main-table bg-card/80 flex-1 border border-border rounded-md gap-2">
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
            value={account}
            onChange={setAccount}
            placeholder="Select Account"
            options={accountOptions ?? []}
          />
          <Dropdown
            id="transaction-category"
            name="categoryId"
            value={category}
            onChange={setCategory}
            placeholder="Select Category"
            options={categoryOptions ?? []}
          />
          <Dropdown
            id="transaction-type"
            name="transactionType"
            value={transactionType}
            onChange={setTransactionType}
            placeholder="Select Type"
            options={transactionTypeOptions}
          />
          <DateRangePicker
            value={dateRange}
            onChange={setDateRange}
          />
          <button className="
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
          >
            <Plus />
            <span>
              Add Transactions
            </span>
          </button>
        </div>
        <div className="w-full overflow-auto">
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
              {transactionError ? (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-sm text-expense">
                    {transactionError}
                  </td>
                </tr>
              ) : sampleTransactions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-sm text-muted-foreground">
                    No transactions yet.
                  </td>
                </tr>
              ) : (
                sampleTransactions.map((transaction, index) => {
                  const rowColor =
                    index % 2 === 0
                      ? "bg-transaction-card-1 text-transaction-card-1-foreground"
                      : "bg-transaction-card-2 text-transaction-card-2-foreground";

                  const isIncome = transaction.type === "Income";

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
      </section>
    </div>
  )
}