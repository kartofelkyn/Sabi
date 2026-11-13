"use client";

import { useEffect, useState } from "react";

import type { CreateTransactionDto } from "@/types/transaction/CreateTransactionDto";
import type { Status } from "@/types/common/submitStatus";
import type { AccountsDropdown, CategoriesDropdown } from "@/types/common/dropdown";
import { transactionTypeOptions } from "@/constants/transactions/transaction-type-options";

import FormDropdown from "../common/FormDropdown";
import { Spinner, CheckIcon, ErrorIcon } from "../common/FormSubmitIcon";
import { sleep } from "@/utils/sleep";


interface AddTransactionModalProps {
    accounts: AccountsDropdown[],
    categories: CategoriesDropdown[],
    type: typeof transactionTypeOptions,
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (transaction: CreateTransactionDto) => Promise<void>;
}

const fieldClass =
    "w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground " +
    "placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary";

const labelClass = "mb-1 block text-sm font-medium text-foreground";

export default function AddTransactionModal({
    accounts,
    categories,
    type,
    isOpen,
    onClose,
    onSubmit
}: AddTransactionModalProps) {
    // Form input
    const [accountId, setAccountId] = useState<number | null>(null);
    const [categoryId, setCategoryId] = useState<number | null>(null);
    const [transactionType, setTransactionType] = useState<number | null>(null);
    const [initialAmount, setInitialAmount] = useState("");
    const [description, setDescription] = useState("");
    const [transactionDate, setTransactionDate] = useState("");

    const [error, setError] = useState<string | null>(null);

    // Status modal
    const [status, setStatus] = useState<Status>("idle");

    const isBusy = status === "loading" || status === "success";

    useEffect(() => {
        if (!isOpen) return;

        const onKeyDown = (e: KeyboardEvent) => {
            if (e.key == "Escape") {
                resetForm();
                onClose();
            }
        }

        window.addEventListener("keydown", onKeyDown);

        return () => window.removeEventListener("keydown", onKeyDown);
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    function resetForm() {
        setAccountId(null);
        setCategoryId(null);
        setTransactionType(null);
        setInitialAmount("");
        setDescription("");
        setTransactionDate("");
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

        if (accountId === null) {
            return setError("Account is required.");
        }
        if (categoryId === null) {
            return setError("Category is required.");
        }
        if (transactionType === null) {
            return setError("Transaction Type is required.");
        }
        if (transactionDate === null) {
            return setError("Transaction Date is required.")
        }

        const amount = Number(initialAmount);

        if (
            initialAmount.trim() === "" ||
            !Number.isFinite(amount) ||
            amount < 0
        ) {
            return setError("Enter a valid non-negative amount");
        }

        const transactionData: CreateTransactionDto = {
            accountId: accountId,
            categoryId: categoryId,
            type: transactionType,
            amount: amount,
            description: description,
            transactionDate: transactionDate
        }

        try {
            setError(null);
            setStatus("loading");

            const [result] = await Promise.allSettled([
                onSubmit(transactionData),
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
                    : "Failed to create transaction."
            )
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
                            <h2 className="text-lg font-bold">Add Transaction</h2>
                            <p className="text-sm text-muted-foreground">Create a new transaction.</p>
                        </div>

                        <div className="flex flex-col gap-4 px-6 py-5">
                            <div className="grid grid-cols-2 gap-3">


                                <div>
                                    <FormDropdown
                                        id="account"
                                        name="account"
                                        label="Account Name"
                                        options={accounts.map((item) => ({
                                            value: item.id,
                                            label: item.name,
                                        }))}
                                        value={accountId}
                                        onChange={setAccountId}
                                        className={fieldClass}
                                    />
                                </div>
                                <div>
                                    <FormDropdown
                                        id="category"
                                        name="category"
                                        label="Category"
                                        options={categories.map((item) => ({
                                            value: item.id,
                                            label: item.name,
                                        }))}
                                        value={categoryId}
                                        onChange={setCategoryId}
                                        className={fieldClass}
                                    />
                                </div>
                                <div>
                                    <FormDropdown
                                        id="transaction-type"
                                        name="TransactionType"
                                        label="Transaction Type"
                                        options={type.map((item) => ({
                                            value: item.id,
                                            label: item.name,
                                        }))}
                                        value={transactionType}
                                        onChange={setTransactionType}
                                        className={fieldClass}
                                    />
                                </div>
                                <div>
                                    <label htmlFor="transaction-date" className={labelClass}>
                                        Transaction Date
                                    </label>
                                    <input
                                        id="transaction-date"
                                        type="date"
                                        className={fieldClass}
                                        value={transactionDate}
                                        max={new Date().toLocaleDateString("en-CA")}
                                        onChange={(e) => setTransactionDate(e.target.value)}
                                        required
                                    />
                                </div>
                                <div>
                                    <label htmlFor="amount" className={labelClass}>
                                        Amount
                                    </label>
                                    <div className="relative">
                                        <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-sm text-muted-foreground">
                                            ₱
                                        </span>
                                        <input
                                            id="amount"
                                            type="number"
                                            step="100"
                                            className={`${fieldClass} pl-8 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none`}
                                            value={initialAmount}
                                            onChange={(e) => setInitialAmount(e.target.value)}
                                            placeholder="0.00"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label htmlFor="amount" className={labelClass}>
                                    Description
                                </label>
                                <input
                                    id="description"
                                    type="text"
                                    className={`${fieldClass} pl-8 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none`}
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder="Enter description."
                                />
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
                                Save Transaction
                            </button>
                        </div>
                    </form>
                )}
                {status === "loading" && (
                    <div className="flex flex-col items-center justify-center gap-3 px-6 py-12">
                        <Spinner />

                        <h2 className="text-lg font-bold">
                            Creating Transaction...
                        </h2>

                        <p className="text-sm text-muted-foreground text-center">
                            Please wait while we create your transaction.
                        </p>
                    </div>
                )}

                {status === "success" && (
                    <div className="flex flex-col items-center justify-center gap-3 px-6 py-12">
                        <CheckIcon />

                        <h2 className="text-lg font-bold">
                            Transaction created!
                        </h2>

                        <p className="text-sm text-muted-foreground text-center">
                            Your transaction has been successfully created.
                        </p>
                    </div>
                )}

                {status === "error" && (
                    <div className="flex flex-col items-center justify-center gap-3 px-6 py-12">
                        <ErrorIcon />

                        <h2 className="text-lg font-bold">
                            Creation failed
                        </h2>

                        <p className="text-sm text-expense text-center">
                            Failed to create transaction.
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
    )
}