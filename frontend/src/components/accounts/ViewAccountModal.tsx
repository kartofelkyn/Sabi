
"use client";

import { useEffect, useState } from "react";

import { formatCurrency } from "@/utils/formatCurrency";
import type { CashDenominationDto } from "@/types/cashDenomination/cashDenominationResponseDto";
import { GetAccountCashDenomination } from "@/services/cashdenomination.service";
import { Spinner, ErrorIcon } from "../common/FormSubmitIcon";

interface ViewAccountModalProps {
    selectedAccount: number | null;
    isOpen: boolean;
    onClose: () => void;
}

export default function ViewAccountModal({
    selectedAccount,
    isOpen,
    onClose
}: ViewAccountModalProps) {
    const [accountName, setAccountName] = useState("");
    const [cashDenomination, setCashDenomination] =
        useState<CashDenominationDto[]>([]);

    const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
    const [error, setError] = useState<string | null>(null);

    const totalCash = cashDenomination.reduce(
        (total, cash) => total + cash.subtotal,
        0
    );

    useEffect(() => {
        if (!isOpen) return;

        let isActive = true;

        async function loadCashDenomination() {
            try {
                if (selectedAccount == null || selectedAccount < 0) {
                    throw new Error("Invalid account selected.");
                }

                setStatus("loading");
                setError(null);
                setAccountName("");
                setCashDenomination([]);

                const data = await GetAccountCashDenomination(selectedAccount);

                if (isActive) {
                    setAccountName(data.accountName);
                    setCashDenomination(data.denominations);
                    setStatus("idle");
                }
            } catch (err) {
                if (isActive) {
                    setError(
                        err instanceof Error
                            ? err.message
                            : "Failed to load account."
                    );
                    setStatus("error");
                }
            }
        }

        loadCashDenomination();

        return () => {
            isActive = false;
        };
    }, [isOpen, selectedAccount]);

    useEffect(() => {
        if (!isOpen) return;

        const onKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
        };

        window.addEventListener("keydown", onKeyDown);

        return () => window.removeEventListener("keydown", onKeyDown);
    }, [isOpen, onClose]);

    if (!isOpen) return null;


    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
            onMouseDown={(e) => {
                if (e.target === e.currentTarget) onClose();
            }}
        >
            <div className="w-full max-w-sm rounded-lg border border-border bg-card text-card-foreground shadow-xl">

                {/* Header */}
                <div className="border-b border-border px-4 py-3">
                    <h2 className="text-base font-semibold">
                        {accountName}
                    </h2>
                    <p className="text-xs text-muted-foreground">
                        Cash Denominations
                    </p>
                </div>

                <div className="p-4">

                    {status === "loading" && (
                        <div className="flex items-center justify-center gap-3 py-8">
                            <Spinner />
                            <span className="text-sm text-muted-foreground">
                                Loading...
                            </span>
                        </div>
                    )}

                    {status === "error" && (
                        <div className="py-6 text-center">
                            <p className="text-sm text-expense">
                                {error}
                            </p>
                        </div>
                    )}

                    {status === "idle" && (
                        <>
                            <div className="mb-4 rounded-md bg-background p-3">
                                <p className="text-xs text-muted-foreground">
                                    Total Cash
                                </p>
                                <p className="text-xl font-bold tabular-nums">
                                    {formatCurrency(totalCash)}
                                </p>
                            </div>
                            <div className="grid grid-cols-3 gap-2 border-b border-border px-2 pb-2 text-xs font-medium text-muted-foreground">
                                <span>Denomination</span>
                                <span className="text-center">Quantity</span>
                                <span className="text-right">Subtotal</span>
                            </div>
                            <div className="max-h-64 divide-y divide-border overflow-y-auto">
                                {cashDenomination.map((cash) => (
                                    <div
                                        key={cash.denominationValue}
                                        className="grid grid-cols-3 items-center gap-2 px-2 py-2 text-sm"
                                    >
                                        <span className="font-medium">
                                            {formatCurrency(cash.denominationValue)}
                                        </span>

                                        <span className="text-center text-muted-foreground tabular-nums">
                                            {cash.quantity}
                                        </span>

                                        <span className="text-right tabular-nums">
                                            {formatCurrency(cash.subtotal)}
                                        </span>
                                    </div>
                                ))}
                            </div>

                            {cashDenomination.length === 0 && (
                                <p className="py-6 text-center text-sm text-muted-foreground">
                                    No cash denominations found.
                                </p>
                            )}
                        </>
                    )}
                </div>
                <div className="flex justify-end border-t border-border px-4 py-3">
                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-md border border-border px-4 py-1.5 text-sm font-medium hover:bg-card-hover"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );

}
