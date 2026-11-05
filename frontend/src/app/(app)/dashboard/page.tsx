"use client";

import { useEffect, useState } from "react";
import SummaryCard from "@/components/dashboard/SummaryCard";

import type { FinanceDashboard } from "@/types/finance/FinanceDashboard";
import { getFinanceDashboard } from "@/services/finance.service";

import MonthlyTrendsChart from "@/components/dashboard/MonthlyTrendsChart";

import ExpenseBreakdownChart from "@/components/dashboard/ExpenseBreakdownChart";

export default function DashboardHome() {
  const Name = "Warren"; // Change later after login feature

  const [greeting, setGreeting] = useState("Good Day");

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-PH", {
      style: "currency",
      currency: "PHP",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  useEffect(() => {
    const hour = new Date().getHours();

    const message =
      hour < 12
        ? "Good Morning"
        : hour < 17
          ? "Good Afternoon"
          : "Good Evening";

    setGreeting(message);
  }, []);

  const [dashboard, setDashboard] = useState<FinanceDashboard | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const getDisplayValue = (amount?: number): string => {
    if (isLoading) return "Loading...";
    if (error || amount === undefined) return "Unavailable";

    return formatCurrency(amount);
  };

  useEffect(() => {
    let isActive = true;

    async function loadData() {
      try {
        setIsLoading(true);
        setError(null);

        const data = await getFinanceDashboard(2026);

        if (isActive) {
          setDashboard(data);
        }
      } catch (error) {
        if (isActive) {
          setError(
            error instanceof Error
              ? error.message
              : "Failed to load finance summary."
          );
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
    };
  }, []);

  useEffect(() => {
    console.log("Finance Dashboard:", dashboard);
  }, [dashboard]);

  const summaryCards = [
    {
      title: "Available Balance",
      value: getDisplayValue(dashboard?.summary.combinedBalance),
      description: "Combined balance across accounts",
    },
    {
      title: "Total Income",
      value: getDisplayValue(dashboard?.summary.totalIncome),
      description: "Total Income",
    },
    {
      title: "Total Expenses",
      value: getDisplayValue(dashboard?.summary.totalExpenses),
      description: "Total Expenses",
    },
    {
      title: "Net Cash Flow",
      value: getDisplayValue(dashboard?.summary.netCashFlow),
      description: "Net cash flow",
    },
  ];

  return (
    <div className="main-dashboard-page flex flex-col gap-3">
      <section className="header w-full min-h-16 flex flex-wrap gap-3 justify-between px-6 py-4 items-center bg-card/90 rounded-md border border-border">
        <div className="greetings">
          <h1 className="font-bold text-xl text-foreground text-shadow-[1px_1px_1px_var(--primary)]">
            {greeting}, {Name}!
          </h1>
          <p className="font-normal text-[0.7em] text-muted-foreground">
            Here's your financial overview.
          </p>
        </div>

        <select
          defaultValue="alltime"
          className="font-semibold px-2 bg-muted-foreground text-primary-foreground h-8 w-24 border border-border rounded-md"
        >
          <option value="alltime">All Time</option>
          <option value="yearly">Yearly</option>
          <option value="monthly">Monthly</option>
          <option value="weekly">Weekly</option>
          <option value="daily">Daily</option>
        </select>
      </section>
      <section className="main-cards w-full px-4 py-4 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4 rounded-md bg-card/90">
        {summaryCards.map((card) => (
          <SummaryCard
            key={card.title}
            title={card.title}
            value={card.value}
            description={card.description}
          />
        ))}
      </section>
      <section className="analytics grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-card/90 rounded-md min-h-64 p-4">
          <h2 className="text-base font-semibold text-foreground mb-4">
            Monthly Trends
          </h2>

          {isLoading ? (
            <p className="text-muted-foreground">
              Loading chart...
            </p>
          ) : error ? (
            <p className="text-muted-foreground">
              Unable to load monthly trends.
            </p>
          ) : dashboard ? (
            <MonthlyTrendsChart data={dashboard.monthlyTrends} />
          ) : (
            <p className="text-muted-foreground">
              No monthly trends available.
            </p>
          )}
        </div>

        <div className="bg-card/90 rounded-md min-h-64 p-4">
          <h2 className="text-base font-semibold text-foreground">
            Expense Breakdown
          </h2>
          {isLoading ? (
            <p className="text-sm text-muted-foreground">
              Loading expenses...
            </p>
          ) : error ? (
            <p className="text-sm text-muted-foreground">
              Unable to load expense breakdown.
            </p>
          ) : dashboard ? (
            <ExpenseBreakdownChart
              data={dashboard.expensesByCategory}
            />
          ) : null}
        </div>
      </section>
    </div>
  )
}