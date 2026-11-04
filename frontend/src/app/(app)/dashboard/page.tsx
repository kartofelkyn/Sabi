"use client";

import { useEffect, useState } from "react";
import SummaryCard from "@/components/dashboard/SummaryCard";
import type { FinanceSummary } from "@/types/finance/FinanceSummary";
import { getFinanceSummary } from "@/services/finance.service";

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

  const [summary, setSummary] = useState<FinanceSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isActive = true;

    async function loadData() {
      try {
        setIsLoading(true);
        setError(null);

        const data = await getFinanceSummary();

        if (isActive) {
          setSummary(data);
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
    console.log("Finance Summary:", summary);
  }, [summary]);

  const summaryCards = [
    {
      title: "Available Balance",
      value: isLoading ? "Loading..."
      : error
        ? "Unavailable"
        : summary 
          ? formatCurrency(summary?.combinedBalance) : 
          "Unavailable",
      description: "Net Worth across all"
    },
    {
      title: "Monthly Income",
      value: isLoading ? "Loading..."
      : error
        ? "Unavailable"
        : summary 
          ? formatCurrency(summary?.totalIncome) : 
          "Unavailable",
      description: "Total Income"
    },
    {
      title: "Monthly Expenses",
      value: isLoading ? "Loading..."
      : error
        ? "Unavailable"
        : summary 
          ? formatCurrency(summary?.totalExpenses) : 
          "Unavailable",
      description: "Total Expenses"
    },
    {
      title: "Net Cash Flow",
      value: isLoading ? "Loading..."
      : error
        ? "Unavailable"
        : summary 
          ? formatCurrency(summary?.netCashFlow) : 
          "Unavailable",
      description: "Net cash flow"
    },
  ]
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
      <section className="main-cards w-full px-4 py-4 grid grid-cols-1 gap-4 md:grid-cols-2 rounded-md bg-card/90">
        {summaryCards.map((card) => (
          <SummaryCard
            key={card.title}
            title={card.title}
            value={card.value}
            description={card.description}
          />
        ))}
      </section>
      <section className="monthly-trends w-full h-64 bg-card/90 rounded-md">
        <h2 className="text-base font-semibold text-foreground">
          Monthly Trends
        </h2>
      </section>
    </div>
  )
}