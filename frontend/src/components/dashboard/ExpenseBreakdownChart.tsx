
"use client";

import {
    PieChart,
    Pie,
    Cell,
    Tooltip,
    ResponsiveContainer,
} from "recharts";

import type { ExpenseByCategory } from "@/types/finance/FinanceDashboard";

interface ExpenseBreakdownChartProps {
    data: ExpenseByCategory[];
}

const CHART_COLORS = [
    "var(--chart-1)",
    "var(--chart-2)",
    "var(--chart-3)",
    "var(--chart-4)",
    "var(--chart-5)",
    "var(--chart-6)",
];

const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat("en-PH", {
        style: "currency",
        currency: "PHP",
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(amount);
};

export default function ExpenseBreakdownChart({
    data,
}: ExpenseBreakdownChartProps) {
    const chartData = data
        .filter((item) => item.totalAmount > 0)
        .map((item) => ({
            name: item.categoryName,
            value: item.totalAmount,
            categoryId: item.categoryId,
        }));

    const totalExpenses = chartData.reduce(
        (total, item) => total + item.value,
        0
    );

    if (chartData.length === 0) {
        return (
            <div className="flex h-64 items-center justify-center text-sm text-muted-foreground">
                No expense data available.
            </div>
        );
    }

    return (
        <div className="flex w-full flex-col gap-4">
            <div className="relative h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={chartData}
                            dataKey="value"
                            nameKey="name"
                            cx="50%"
                            cy="50%"
                            innerRadius="65%"
                            outerRadius="85%"
                            paddingAngle={3}
                            cornerRadius={5}
                            stroke="none"
                            isAnimationActive={true}
                        >
                            {chartData.map((item, index) => (
                                <Cell
                                    key={item.categoryId}
                                    fill={CHART_COLORS[index % CHART_COLORS.length]}
                                />
                            ))}
                        </Pie>

                        <Tooltip
                            formatter={(value) =>
                                formatCurrency(Number(value))
                            }
                            contentStyle={{
                                backgroundColor: "var(--card)",
                                border: "1px solid var(--border)",
                                borderRadius: "8px",
                                color: "var(--foreground)",
                            }}
                            labelStyle={{
                                color: "var(--foreground)",
                            }}
                            itemStyle={{
                                color: "var(--foreground)",
                            }}
                        />
                    </PieChart>
                </ResponsiveContainer>

                <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-xs text-muted-foreground">
                        Total Expenses
                    </span>
                    <span className="text-lg font-semibold text-foreground">
                        {formatCurrency(totalExpenses)}
                    </span>
                </div>
            </div>

            <div className="flex flex-col gap-3">
                {chartData.map((item, index) => {
                    const percentage =
                        (item.value / totalExpenses) * 100;

                    return (
                        <div
                            key={item.categoryId}
                            className="flex items-center justify-between gap-3 text-sm"
                        >
                            <div className="flex min-w-0 items-center gap-2">
                                <span
                                    className="size-2.5 shrink-0 rounded-full"
                                    style={{
                                        backgroundColor:
                                            CHART_COLORS[index % CHART_COLORS.length],
                                    }}
                                />

                                <span className="truncate text-foreground">
                                    {item.name}
                                </span>
                            </div>

                            <div className="flex shrink-0 items-center gap-3">
                                <span className="text-muted-foreground">
                                    {percentage.toFixed(1)}%
                                </span>

                                <span className="font-medium text-foreground">
                                    {formatCurrency(item.value)}
                                </span>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
