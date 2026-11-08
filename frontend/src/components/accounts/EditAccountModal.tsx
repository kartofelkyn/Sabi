"use client";

import { useEffect, useState } from "react";

import { AccountType } from "@/types/accounts/AccountType";
import { currencies } from "@/types/accounts/Currencies";

import type { EditAccountDto } from "@/types/accounts/EditAccountDto";

import { GetAccount } from "@/services/account.service";
import type { AccountResponse } from "@/types/accounts/AccountResponse";

import type { Status } from "@/types/common/submitStatus";
import { sleep } from "@/utils/sleep";

interface EditAccountModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (account: EditAccountDto) => Promise<void>;
    onDelete: () => Promise<void>;
    accountId: number;
}

const fieldClass =
    "w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground " +
    "placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary";

const labelClass = "mb-1 block text-sm font-medium text-foreground";

export default function EditAccountModal({
    isOpen,
    onClose,
    onSubmit,
    onDelete,
    accountId
}: EditAccountModalProps) {
    const [accountName, setAccountName] = useState("");
    const [initialBalance, setInitialBalance] = useState("");
    const [currency, setCurrency] = useState("PHP");
    const [type, setType] = useState<AccountType | "">("");
    const [error, setError] = useState<string | null>(null);

    const [account, setAccount] = useState<AccountResponse | null>(null);

    const selectedCurrency = currencies.find((item) => item.code === currency);

    // Status modal
    const [status, setStatus] = useState<Status>("idle");

    const isBusy = status === "loading" || status === "success";

    const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
    const [operation, setOperation] = useState<"edit" | "delete">("edit");
    const [deleteConfirmationName, setDeleteConfirmationName] = useState("");
    const [originalAccountName, setOriginalAccountName] = useState("");

    // Fetch account
    useEffect(() => {
        if (!isOpen || accountId < 0) return;

        const fetchAccount = async () => {
            try {
                const response = await GetAccount(accountId);

                setAccount(response);
            } catch (error) {
                setError("Failed to load account details.");
            }
        }

        fetchAccount();
    }, [isOpen])

    useEffect(() => {
        if (!account) return;

        setAccountName(account.name);
        setOriginalAccountName(account.name);
        setInitialBalance(String(account.initialBalance));
        setCurrency(account.currency);
        setType(account.type);
    }, [account])

    // Close on Escape
    useEffect(() => {
        if (!isOpen) return;

        const onKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape" && !isBusy) {

                if (showDeleteConfirmation) {
                    setShowDeleteConfirmation(false);
                    return;
                }

                resetForm();
                onClose();
            }
        };

        window.addEventListener("keydown", onKeyDown);

        return () => window.removeEventListener("keydown", onKeyDown);
    }, [isOpen, onClose, isBusy, showDeleteConfirmation]);

    if (!isOpen) return null;

    if (accountId == 0) {
        return null;
    }

    function resetForm() {
        setAccount(null);
        setAccountName("");
        setInitialBalance("");
        setCurrency("PHP");
        setType("");
        setError(null);
        setStatus("idle");
        setShowDeleteConfirmation(false);
        setOperation("edit");
        setDeleteConfirmationName("");
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

        const accountData: EditAccountDto = {
            name: accountName.trim(),
            initialBalance: balance,
            currency: currency,
            type: type,
        }

        try {
            setError(null);
            setOperation("edit");
            setStatus("loading");

            const [result] = await Promise.allSettled([
                onSubmit(accountData),
                sleep(1000),
            ]);

            if (result.status === "rejected") throw result.reason;

            setStatus("success");
            await sleep(1000);

            resetForm();
            onClose();
        } catch (error) {
            setStatus("error");
            setError(
                error instanceof Error
                    ? error.message
                    : "Failed to edit account."
            )
        }
    }

    async function handleDelete() {
        if (deleteConfirmationName !== originalAccountName) {
            return;
        }

        try {
            setShowDeleteConfirmation(false);
            setError(null);
            setOperation("delete");
            setStatus("loading");

            await onDelete();

            setStatus("success");
            await sleep(1000);

            resetForm();
            onClose();
        } catch (error) {
            setStatus("error");

            setError(
                error instanceof Error
                    ? error.message
                    : "Failed to delete account."
            );
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
                            <h2 className="text-lg font-bold">Edit Account</h2>
                            <p className="text-sm text-muted-foreground">
                                Edit {accountName} account.
                            </p>
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
                                        setType(
                                            e.target.value === ""
                                                ? ""
                                                : Number(e.target.value) as AccountType
                                        )
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

                            {error && (
                                <p className="text-sm text-expense">{error}</p>
                            )}
                        </div>

                        <div className="flex flex-row justify-between gap-2 border-t border-border px-6 py-4">
                            <button
                                type="button"
                                onClick={() => setShowDeleteConfirmation(true)}
                                className="rounded-md bg-account-card-1-foreground px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 transition-opacity"
                            >
                                Delete
                            </button>
                            <div className="flex flex-row gap-3">
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
                                    Save changes
                                </button>
                            </div>
                        </div>
                    </form>
                )}

                {status === "loading" && (
                    <div className="flex flex-col items-center justify-center gap-3 px-6 py-12">
                        <Spinner />

                        <h2 className="text-lg font-bold">
                            {operation === "delete"
                                ? "Deleting account..."
                                : "Updating account..."}
                        </h2>

                        <p className="text-sm text-muted-foreground text-center">
                            {operation === "delete"
                                ? "Please wait while we delete your account."
                                : "Please wait while we save your changes."}
                        </p>
                    </div>
                )}

                {status === "success" && (
                    <div className="flex flex-col items-center justify-center gap-3 px-6 py-12">
                        <CheckIcon />

                        <h2 className="text-lg font-bold">
                            {operation === "delete"
                                ? "Account deleted!"
                                : "Account updated!"}
                        </h2>

                        <p className="text-sm text-muted-foreground text-center">
                            {operation === "delete"
                                ? "Your account has been successfully deleted."
                                : "Your account information has been successfully updated."}
                        </p>
                    </div>
                )}

                {status === "error" && (
                    <div className="flex flex-col items-center justify-center gap-3 px-6 py-12">
                        <ErrorIcon />

                        <h2 className="text-lg font-bold">
                            {operation === "delete"
                                ? "Delete failed"
                                : "Update failed"}
                        </h2>

                        <p className="text-sm text-expense text-center">
                            {error ??
                                (operation === "delete"
                                    ? "Failed to delete account."
                                    : "Failed to edit account.")}
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
            {showDeleteConfirmation && (
                <div
                    className="fixed inset-0 z-60 flex items-center justify-center bg-black/60 p-4"
                    onMouseDown={(e) => {
                        if (e.target === e.currentTarget) {
                            setShowDeleteConfirmation(false);
                            setDeleteConfirmationName("");
                        }
                    }}
                >
                    <div className="w-full max-w-sm rounded-lg border border-border bg-card p-6 text-card-foreground shadow-xl">

                        <h2 className="text-lg font-bold">
                            Delete Account?
                        </h2>

                        <p className="mt-2 text-sm text-muted-foreground">
                            Are you sure you want to delete{" "}
                            <span className="font-semibold text-foreground">
                                {originalAccountName}
                            </span>
                            ? This action cannot be undone.
                        </p>

                        <div className="mt-4">
                            <label
                                htmlFor="delete-account-confirmation"
                                className={labelClass}
                            >
                                Type <span className="font-bold text-foreground">{originalAccountName}</span> to confirm.
                            </label>
                            <input
                                id="delete-account-confirmation"
                                type="text"
                                className={fieldClass}
                                value={deleteConfirmationName}
                                onChange={(e) => setDeleteConfirmationName(e.target.value)}
                                placeholder="Enter account name"
                                autoComplete="off"
                            />
                        </div>

                        <div className="mt-6 flex justify-end gap-3">

                            <button
                                type="button"
                                onClick={() => setShowDeleteConfirmation(false)}
                                className="rounded-md border border-border px-4 py-2 text-sm font-medium hover:bg-card-hover transition-colors"
                            >
                                Cancel
                            </button>

                            <button
                                type="button"
                                onClick={handleDelete}
                                disabled={deleteConfirmationName !== originalAccountName}
                                className="rounded-md bg-account-card-1-foreground px-4 py-2 text-sm font-medium text-white hover:opacity-90 transition-opacity disabled:cursor-not-allowed disabled:opacity-40"
                            >
                                Yes, Delete
                            </button>

                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

function formatEnumLabel(value: string): string {
    return value.replace(/([a-z])([A-Z])/g, "$1 $2");
}

function Spinner() {
    return (
        <svg
            className="h-10 w-10 animate-spin text-primary"
            viewBox="0 0 24 24"
            fill="none"
        >
            <circle
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
                className="opacity-25"
            />
            <path
                d="M4 12a8 8 0 018-8"
                stroke="currentColor"
                strokeWidth="4"
                strokeLinecap="round"
            />
        </svg>
    );
}

function CheckIcon() {
    return (
        <svg
            className="h-12 w-12 text-income animate-[pop_0.3s_ease-out]"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <circle cx="12" cy="12" r="10" />
            <path d="M8 12l3 3 5-6" />
        </svg>
    );
}

function ErrorIcon() {
    return (
        <svg
            className="h-12 w-12 text-expense animate-[pop_0.3s_ease-out]"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <circle cx="12" cy="12" r="10" />
            <path d="M15 9l-6 6m0-6l6 6" />
        </svg>
    );
}