"use client";

import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from "recharts";

import type { MonthlyTrend } from "@/types/finance/FinanceDashboard";

interface MonthlyTrendsChartProps {
    data: MonthlyTrend[];
}

export default function MonthlyTrendsChart({
    data,
}: MonthlyTrendsChartProps) {
    const monthNames = [
        "January", "February", "March", "April",
        "May", "June", "July", "August",
        "September", "October", "November", "December",
    ];

    const formatter = new Intl.NumberFormat("en-PH", {
        notation: "compact",
        maximumFractionDigits: 1,
    });

    const formatCurrency = (amount: number): string => {
        return new Intl.NumberFormat("en-PH", {
            style: "currency",
            currency: "PHP",
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }).format(amount);
    };
    
    return (
        <div className="w-full h-64">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data}>
                    <CartesianGrid
                        stroke="var(--border)"
                        strokeDasharray="3 3"
                        vertical={false}
                    />

                    <XAxis
                        dataKey="month"
                        tickFormatter={(month: number) =>
                            monthNames[month - 1]?.slice(0, 3) ?? ""
                        }
                        tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
                        axisLine={false}
                        tickLine={false}
                    />
                    <YAxis
                        width={65}
                        tickFormatter={(value: number) => `₱${formatter.format(value)}`}
                        tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
                        axisLine={false}
                        tickLine={false}
                    />

                    <Tooltip
                        formatter={(value) => formatCurrency(Number(value))}
                        labelFormatter={(month) =>
                            `${monthNames[Number(month) - 1] ?? "Unknown"} ${data[0]?.year ?? ""}`
                        }
                        contentStyle={{
                            backgroundColor: "var(--card)",
                            border: "1px solid var(--border)",
                            borderRadius: "8px",
                            color: "var(--foreground)",
                        }}
                        labelStyle={{
                            color: "var(--foreground)",
                            fontWeight: 600,
                        }}
                        itemStyle={{
                            color: "var(--foreground)",
                        }}
                        cursor={{
                            fill: "var(--card-hover)",
                            fillOpacity: 0.5,
                        }}
                    />

                    <Legend
                        verticalAlign="bottom"
                        align="center"
                        iconType="circle"
                        iconSize={8}
                    />

                    <Bar
                        dataKey="totalIncome"
                        name="Income"
                        fill="var(--chart-income)"
                        radius={[4, 4, 0, 0]}
                    />

                    <Bar
                        dataKey="totalExpenses"
                        name="Expenses"
                        fill="var(--chart-expenses)"
                        radius={[4, 4, 0, 0]}
                    />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}