"use client";

import { useEffect, useState } from "react";
import type { AccountSummary } from "@/types/accounts/AccountsSummary";
import { GetAccountSummary } from "@/services/account.service";

import { SquarePen } from "lucide-react";

export default function AccountsPage() {
  const [accountList, setAccountList] = useState<AccountSummary[]>([]);
  const [selectedAccountId, setSelectedAccountId] = useState<number | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-PH", {
      style: "currency",
      currency: "PHP",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  }
  // Get Account Summary list data
  useEffect(() => {
    let isActive = true;

    async function loadData() {
      try {
        setIsLoading(true);
        setError(null);

        const data = await GetAccountSummary();

        if (isActive) {
          setAccountList(data);
          setSelectedAccountId(data[0]?.accountId ?? null);
        }
      } catch (error) {
        if (isActive) {
          setError(
            error instanceof Error
              ? error.message
              : "Failed to load account summary."
          )
        }
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    }

    loadData();

    return () => {
      isActive = false;
    }
  }, [])

  useEffect(() => {
    console.log("Account List:", accountList);
  }, [accountList]);

  return (
    <div className="main-dashboard-page flex flex-row h-full">
      <section className="Accounts-list h-full w-72 flex flex-col overflow-y-auto border border-border">
        <header className="h-20 shrink-0 flex flex-col justify-center bg-card border-b border-border px-3 rounded-tl-md">
          <h2 className="text-lg text-foreground font-bold">
            Accounts
          </h2>
          <p className="text-xs text-muted-foreground">
            List of all active accounts
          </p>
        </header>
        <div className="bg-card/70 flex-1 rounded-bl-md ">
          {accountList.map((account, index) => {
            const isSelected = selectedAccountId === account.accountId;

            const cardColor = isSelected
              ? "bg-account-card-selected border-account-card-selected-border text-account-card-1-foreground"
              : index % 2 === 0
                ? "bg-account-card-1 border-account-card-1-border hover:bg-card-hover text-account-card-1-foreground "
                : "bg-account-card-2 border-account-card-2-border hover:bg-card-hover text-account-card-2-foreground ";
            return (
              <div
                key={account.accountId}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.target !== e.currentTarget) return; // ignore keys from the inner button
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    setSelectedAccountId(account.accountId);
                  }
                }}
                onClick={() => setSelectedAccountId(account.accountId)}
                className={`
                  ${cardColor}
                  w-full min-h-20 px-3 text-left py-3 flex flex-col gap-1
                  border-b border-l-4 transition-colors
                `}
              >
                <div className="card-header flex flex-row justify-between pr-3 ">
                  <p className={`
                    text-base ${isSelected ? "font-bold" : "font-semibold"}
                  `}>
                    {account.accountName}
                  </p>
                  <button
                    type="button"
                    aria-label={`Edit ${account.accountName}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      // open edit modal here
                    }}
                  >
                    <SquarePen size={15} />
                  </button>
                </div>
                <div className="accounts-info flex flex-col gap-0.5">
                  <div className="balance flex flex-row justify-between pr-3">
                    <p className={`
                    text-sm
                    ${isSelected ? "font-normal" : "font-medium"}  
                  `}>
                      Balance:
                    </p>
                    <p className={`
                    text-sm 
                    ${isSelected ? "font-medium" : "font-normal"}  
                  `}>
                      {formatCurrency(account.balance)}
                    </p>
                  </div>
                  <div className="balance flex flex-row justify-between pr-3">
                    <p className={`
                    text-sm ${isSelected ? "font-normal" : "font-medium"}  
                  `}>
                      Inflow:
                    </p>
                    <p className={`
                    text-sm ${isSelected ? "font-medium" : "font-normal"}  
                  `}>
                      {formatCurrency(account.totalIncome)}
                    </p>
                  </div>
                  <div className="balance flex flex-row justify-between pr-3">
                    <p className={`
                    text-sm ${isSelected ? "font-normal" : "font-medium"}  
                  `}>
                      Outflow:
                    </p>
                    <p className={`
                    text-sm ${isSelected ? "font-medium" : "font-normal"}  
                  `}>
                      {formatCurrency(account.totalExpense)}
                    </p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </section>
      <section className="transaction-list h-full flex flex-col flex-1 overflow-auto border-border">
        <header className="h-20 shrink-0 flex flex-col justify-center bg-card-secondary border-b border-border px-3 rounded-tr-md">
          <h2 className="text-lg text-foreground font-bold">
            Transaction List
          </h2>
          <p className="text-xs text-muted-foreground">
            Transactions for selected account
          </p>
        </header>
        <div className="bg-card-secondary/70 flex-1 py-3 px-2 rounded-br-md">

        </div>
      </section>
    </div>
  )
}