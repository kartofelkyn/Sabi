"use client";

import { useEffect, useState } from "react";
import StatCard from "@/components/transactions/StatCard";
import SearchBar from "@/components/common/SearchBar";
import Dropdown from "@/components/common/Dropdown";
import { transactionTypeOptions } from "@/constants/transactions/transaction-type-options";
import type {
  AccountsDropdown,
  CategoriesDropdown,
} from "@/types/common/dropdown";
import {
  getAccountsDropdown,
  getCategoriesDropdown
} from "@/services/common/dropdown.service";
import {
  CalendarDays,
  Plus
} from "lucide-react";


export default function TransactionsPage() {
  const [accountOptions, setAccountOptions] = useState<AccountsDropdown[] | null>(null);
  const [categoryOptions, setCategoryOptions] = useState<CategoriesDropdown[] | null>(null);
  const [accountDropdownLoading, setAccountDropdownLoading] = useState(true);
  const [categoryDropdownLoading, setCategoryDropdownLoading] = useState(true);
  const [accountDropdownError, setAccountDropdownError] = useState<string | null>(null);
  const [categoryDropdownError, setCategoryDropdownError] = useState<string | null>(null);

  const [account, setAccount] = useState<number | null>(null);
  const [category, setCategory] = useState<number | null>(null);
  const [transactionType, setTransactionType] = useState<number | null>(null);

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

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
              className="bg-card-secondary hover:bg-primary/20"
            />
            <StatCard
              label="Total Income"
              value="₱ 15,000.00"
              className="bg-income/65 hover:bg-income/90"
            />
            <StatCard
              label="Total Expenses"
              value="₱ 10,000.00"
              className="bg-expense/65 hover:bg-expense/90"
            />
            <StatCard
              label="Net Cash"
              value="₱ 5,000.00"
              className="bg-primary/65 hover:bg-primary/90"
            />
          </div>

        </div>
      </header>
      <section className="main-table bg-card/80 flex-1 border border-border rounded-md gap-2">
        <div className="w-full flex flex-row py-3 px-6 items-center min-h-20 border-b-2 border-border justify-between gap-2">
          <SearchBar className="w-70 h-10" placeholder="Search transactions" />
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
          <div className="flex items-center gap-2 h-10 px-3 border border-border rounded-md bg-card">
            <CalendarDays
              size={18}
              className="text-muted-foreground shrink-0"
            />

            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-32 bg-transparent text-sm text-foreground outline-none"
            />
          </div>
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
      </section>
    </div>
  )
}