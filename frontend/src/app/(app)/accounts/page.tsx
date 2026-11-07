"use client";

import { useEffect, useState } from "react";

import type { AccountSummary } from "@/types/accounts/AccountsSummary";
import type { AccountTransaction } from "@/types/accounts/AccountTransaction";

import { GetAccountSummary } from "@/services/account.service";
import { GetAccountTransaction } from "@/services/account.service";

import { SquarePen } from "lucide-react";

export default function AccountsPage() {
  const [accountList, setAccountList] = useState<AccountSummary[]>([]);
  const [selectedAccountId, setSelectedAccountId] = useState<number | null>(null);
  const [selectedAccountName, setSelectedAccountName] = useState<string | null>(null);

  const [isAccountLoading, setIsAccountLoading] = useState(true);
  const [accountError, setAccountError] = useState<string | null>(null);

  const [transactionList, setTransactionList] = useState<AccountTransaction[]>([]);
  const [isTransactionLoading, setIsTransactionLoading] = useState(false);
  const [transactionError, setTransactionError] = useState<string | null>(null);

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

  // Get Account Summary list data
  useEffect(() => {
    let isActive = true;

    async function loadData() {
      try {
        setIsAccountLoading(true);
        setAccountError(null);

        const data = await GetAccountSummary();

        if (isActive) {
          setAccountList(data);
          setSelectedAccountId(data[0]?.accountId ?? null);
          setSelectedAccountName(data[0]?.accountName ?? null);
        }
      } catch (accountError) {
        if (isActive) {
          setAccountError(
            accountError instanceof Error
              ? accountError.message
              : "Failed to load account summary."
          )
        }
      } finally {
        if (isActive) {
          setIsAccountLoading(false);
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

  // Get transactions for the selected account
  useEffect(() => {
    if (selectedAccountId === null) return;

    let isActive = true;

    async function loadTransactions() {
      try {
        setIsTransactionLoading(true);
        setTransactionError(null);

        const data = selectedAccountId === 0
          ? await GetAccountTransaction()
          : await GetAccountTransaction(selectedAccountId!);

        if (isActive) {
          setTransactionList(data);
        }
      } catch (error) {
        if (isActive) {
          setTransactionError(
            error instanceof Error
              ? error.message
              : "Failed to load transactions."
          );
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
    };
  }, [selectedAccountId]);

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
          {isAccountLoading && !accountError && (
            <p className="px-4 py-10 text-center text-sm text-muted-foreground">
              Accounts Loading...
            </p>
          )}
          {accountError && !isAccountLoading && (
            <p className="px-4 py-10 text-center text-sm text-muted-foreground">
              Unable to load transactions.
            </p>
          )}
          {!accountError && !isAccountLoading && accountList.length === 0 && (
            <p className="px-4 py-10 text-center text-sm text-muted-foreground">
              No accounts found.
            </p>
          )}
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
                onClick={() => {
                  setSelectedAccountId(account.accountId);
                  setSelectedAccountName(account.accountName);
                }}
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
      <section className="transaction-list h-full min-h-0 flex flex-col flex-1 overflow-hidden border border-l-0 border-border">
        <header className="h-20 shrink-0 flex flex-row items-center justify-between bg-card border-b border-border px-6 rounded-tr-md">
          <div>
            <h2 className="text-lg text-foreground font-bold">
              {selectedAccountId === 0
                ? "All Transactions"
                : `${selectedAccountName ?? "Account"} Transactions`}
            </h2>
            <p className="text-xs text-muted-foreground">
              {isTransactionLoading
                ? "Loading transactions..."
                : `${transactionList.length} transaction${transactionList.length === 1 ? "" : "s"}`}
            </p>
          </div>
        </header>

        <div className="bg-background flex-1 min-h-0 rounded-br-md">
          <div className="h-full overflow-y-auto border border-border bg-card">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr>
                  {["Date", "Category", "Description"].map((h) => (
                    <th
                      key={h}
                      className="sticky top-0 z-10 bg-card-secondary border-b border-border px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground"
                    >
                      {h}
                    </th>
                  ))}
                  <th className="sticky top-0 z-10 bg-card-secondary border-b border-border px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground text-right">
                    Amount
                  </th>
                </tr>
              </thead>
              <tbody>
                {transactionError && (
                  <tr>
                    <td colSpan={4} className="px-4 py-10 text-center text-sm text-expense">
                      {transactionError}
                    </td>
                  </tr>
                )}

                {!transactionError && !isTransactionLoading && transactionList.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-4 py-10 text-center text-sm text-muted-foreground">
                      No transactions for this account yet.
                    </td>
                  </tr>
                )}

                {!transactionError &&
                  transactionList.map((transaction, index) => {
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
                        <td className="px-4 py-3 text-sm text-muted-foreground whitespace-nowrap">
                          {formatDate(transaction.transactionDate)}
                        </td>
                        <td className="px-4 py-3">
                          <span className="px-2.5 py-0.5 text-xs font-medium">
                            {transaction.categoryName}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm max-w-xs truncate">
                          {transaction.description || "-"}
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
                  })}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  )
}