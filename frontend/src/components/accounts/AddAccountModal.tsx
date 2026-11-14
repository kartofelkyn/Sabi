"use client";

import { useEffect, useState } from "react";

import { AccountType } from "@/types/accounts/AccountType";
import { currencies } from "@/types/accounts/Currencies";

import type { CreateAccountDto } from "@/types/accounts/CreateAccountDto";

import type { Status } from "@/types/common/submitStatus";

import { sleep } from "@/utils/sleep";
import { Spinner, CheckIcon, ErrorIcon } from "../common/FormSubmitIcon";

interface AddAccountModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (account: CreateAccountDto) => Promise<void>;
}

const fieldClass =
    "w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground " +
    "placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary";

const labelClass = "mb-1 block text-sm font-medium text-foreground";

export default function AddAccountModal({
    isOpen,
    onClose,
    onSubmit
}: AddAccountModalProps) {
    const [accountName, setAccountName] = useState("");
    const [initialBalance, setInitialBalance] = useState("");
    const [currency, setCurrency] = useState("PHP");
    const [type, setType] = useState<AccountType | "">("");
    const [error, setError] = useState<string | null>(null);

    const selectedCurrency = currencies.find((item) => item.code === currency);

    // Status modal
    const [status, setStatus] = useState<Status>("idle");

    const isBusy = status === "loading" || status === "success";

    // Close on Escape
    useEffect(() => {
        if (!isOpen) return;

        const onKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                resetForm();
                onClose();
            }
        };

        window.addEventListener("keydown", onKeyDown);

        return () => window.removeEventListener("keydown", onKeyDown);
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    function resetForm() {
        setAccountName("");
        setInitialBalance("");
        setCurrency("PHP");
        setType("");
        setError(null);
        setStatus("idle");
    }

    function handleClose() {
        if (isBusy) return;
        resetForm();
        onClose();
    }

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();

        if (!accountName.trim()) {
            return setError("Account name is required.");
        }

        const balance = Number(initialBalance);

        if (
            initialBalance.trim() === "" ||
            !Number.isFinite(balance) ||
            balance < 0
        ) {
            return setError("Enter a valid non-negative balance.");
        }

        if (!currencies.some((item) => item.code === currency))
            return setError("Select a valid currency.");

        if (type === "") {
            return setError("Select an account type.");
        }

        const accountData: CreateAccountDto = {
            name: accountName.trim(),
            initialBalance: balance,
            currency: currency,
            type: type,
        }

        try {
            setError(null);
            setStatus("loading");

            const [result] = await Promise.allSettled([
                onSubmit(accountData),
                sleep(1000)
            ])

            if (result.status === "rejected") throw result.reason;

            setStatus("success");
            await sleep(1000);

            resetForm();
            handleClose();
        } catch (error) {
            setError(
                error instanceof Error
                    ? error.message
                    : "Failed to create account."
            );
            
            setStatus("error");
        }
    }

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
            onMouseDown={(e) => {
                if (e.target === e.currentTarget) handleClose();
            }}
        >
            <div className="w-full max-w-md rounded-lg border border-border bg-card text-card-foreground">

                {status === "idle" && (
                    <form onSubmit={handleSubmit}>
                        <div className="border-b border-border px-6 py-4">
                            <h2 className="text-lg font-bold">Add Account</h2>
                            <p className="text-sm text-muted-foreground">Create a new account.</p>
                        </div>

                        <div className="flex flex-col gap-4 px-6 py-5">
                            <div>
                                <label htmlFor="account-name" className={labelClass}>
                                    Account name
                                </label>
                                <input
                                    id="account-name"
                                    type="text"
                                    className={fieldClass}
                                    value={accountName}
                                    onChange={(e) => setAccountName(e.target.value)}
                                    placeholder="e.g. BDO Savings"
                                    autoFocus
                                />
                            </div>

                            <div>
                                <label htmlFor="account-type" className={labelClass}>
                                    Account type
                                </label>
                                <select
                                    id="account-type"
                                    className={fieldClass}
                                    value={type}
                                    onChange={(e) =>
                                        setType(e.target.value === "" ? "" : (Number(e.target.value) as AccountType))
                                    }
                                >
                                    <option value="">Select account type</option>
                                    {Object.entries(AccountType)
                                        .filter(([key]) => isNaN(Number(key)))
                                        .map(([key, value]) => (
                                            <option key={value} value={value}>
                                                {formatEnumLabel(key)}
                                            </option>
                                        ))}
                                </select>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label htmlFor="account-currency" className={labelClass}>
                                        Currency
                                    </label>
                                    <select
                                        id="account-currency"
                                        className={fieldClass}
                                        value={currency}
                                        onChange={(e) => setCurrency(e.target.value)}
                                    >
                                        {currencies.map((item) => (
                                            <option key={item.code} value={item.code}>
                                                {item.code} ({item.symbol})
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label htmlFor="initial-balance" className={labelClass}>
                                        Initial balance
                                    </label>
                                    <div className="relative">
                                        <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-sm text-muted-foreground">
                                            {selectedCurrency?.symbol ?? ""}
                                        </span>
                                        <input
                                            id="initial-balance"
                                            type="number"
                                            step="0.01"
                                            className={`${fieldClass} pl-8 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none`}
                                            value={initialBalance}
                                            onChange={(e) => setInitialBalance(e.target.value)}
                                            placeholder="0.00"
                                        />
                                    </div>
                                </div>
                            </div>

                            {error && <p className="text-sm text-expense">{error}</p>}
                        </div>

                        <div className="flex justify-end gap-2 border-t border-border px-6 py-4">
                            <button
                                type="button"
                                onClick={handleClose}
                                className="rounded-md border border-border px-4 py-2 text-sm font-medium hover:bg-card-hover transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 transition-opacity"
                            >
                                Save account
                            </button>
                        </div>
                    </form>
                )}

                {status === "loading" && (
                    <div className="flex flex-col items-center justify-center gap-3 px-6 py-12">
                        <Spinner />

                        <h2 className="text-lg font-bold">
                            Creating Account...
                        </h2>

                        <p className="text-sm text-muted-foreground text-center">
                            Please wait while we create your account.
                        </p>
                    </div>
                )}

                {status === "success" && (
                    <div className="flex flex-col items-center justify-center gap-3 px-6 py-12">
                        <CheckIcon />

                        <h2 className="text-lg font-bold">
                            Account created!
                        </h2>

                        <p className="text-sm text-muted-foreground text-center">
                            Your account has been successfully created.
                        </p>
                    </div>
                )}

                {status === "error" && (
                    <div className="flex flex-col items-center justify-center gap-3 px-6 py-12">
                        <ErrorIcon />

                        <h2 className="text-lg font-bold">
                            Account creation failed
                        </h2>

                        <p className="text-sm text-expense text-center">
                            {error || "Failed to create account."}
                        </p>

                        <button
                            type="button"
                            onClick={() => {
                                setError(null);
                                setStatus("idle");
                            }}
                            className="mt-3 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
                        >
                            Back to Edit
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

function formatEnumLabel(value: string): string {
    return value.replace(/([a-z])([A-Z])/g, "$1 $2");
}