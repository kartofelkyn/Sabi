"use client";

import { useEffect, useState } from "react";

import type { CreateTransactionDto } from "@/types/transactions/CreateTransactionDto";
import type { CreateCreditPaymentDto } from "@/types/creditPayment/CreateCreditPaymentDto";
import type { Status } from "@/types/common/submitStatus";
import type { AccountsDropdown, CategoriesDropdown } from "@/types/common/dropdown";
import { transactionTypeOptions } from "@/constants/transactions/transaction-type-options";

import FormDropdown from "../common/FormDropdown";
import { Spinner, CheckIcon, ErrorIcon } from "../common/FormSubmitIcon";
import { sleep } from "@/utils/sleep";
import { X, TrendingUp, TrendingDown, CreditCard } from "lucide-react";
import { TransactionTypeEnum } from "@/enums/transaction-type";
import { AccountType } from "@/enums/AccountType";

interface AddTransactionModalProps {
    accounts: AccountsDropdown[],
    categories: CategoriesDropdown[],
    type: typeof transactionTypeOptions,
    isOpen: boolean;
    onClose: () => void;
    onSubmitTransaction: (data: CreateTransactionDto) => Promise<void>;
    onSubmitCreditPayment: (data: CreateCreditPaymentDto) => Promise<void>;
}

const fieldClass =
    "w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground " +
    "placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary";

const labelClass = "mb-1 block text-sm font-medium text-foreground";

const cashFieldClass =
    "w-full rounded-md border border-border bg-background px-3 py-2 text-xs text-foreground " +
    "placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary";

const cashLabelClass = "block text-xs font-medium text-foreground";

const denominations = [
    1000, 500, 200, 100, 50,
    20, 10, 5, 1, 0.25
];

export default function AddTransactionModal({
    accounts,
    categories,
    type,
    isOpen,
    onClose,
    onSubmitTransaction,
    onSubmitCreditPayment
}: AddTransactionModalProps) {
    // Form input
    const [accountId, setAccountId] = useState<number | null>(null);
    const [categoryId, setCategoryId] = useState<number | null>(null);
    const [transactionType, setTransactionType] = useState<number | null>(1);
    const [initialAmount, setInitialAmount] = useState("");
    const [cashQuantities, setCashQuantities] = useState<Record<string, string>>({});
    const [description, setDescription] = useState("");
    const [transactionDate, setTransactionDate] = useState("");
    // Credit input
    const [accountIdFrom, setAccountIdFrom] = useState<number | null>(null);
    const [accountIdTo, setAccountIdTo] = useState<number | null>(null);

    const creditAccounts = accounts.filter(
        (account) => account.type === AccountType.CreditAccount
    );
    const nonCreditAccounts = accounts.filter(
        (account) => account.type !== AccountType.CreditAccount
    );

    const categoriesList = categories.filter(
        (category) => category.type == transactionType
    )

    const selectedAccount = accounts.find(
        (account) => account.id === accountId
    );

    const isPhysicalCash = selectedAccount?.type === AccountType.PhysicalCash;
    const isCreditPayment = transactionType == TransactionTypeEnum.Credit;

    const cashTotal = denominations.reduce((total, denomination) => {
        const quantity = Number(cashQuantities[String(denomination)] || 0);

        return total + (denomination * quantity);
    }, 0);

    // Status modal
    const [error, setError] = useState<string | null>(null);

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

    useEffect(() => {
        setCashQuantities({});
        setInitialAmount("");
    }, [accountId]);

    useEffect(() => {
        setCategoryId(null);
    }, [transactionType]);

    if (!isOpen) return null;

    function handleDenominationChange(denomination: number, quantity: string) {
        setCashQuantities((previous) => ({
            ...previous,
            [String(denomination)]: quantity
        }));
    }

    function resetForm() {
        setAccountId(null);
        setCategoryId(null);
        setTransactionType(1);
        setInitialAmount("");
        setDescription("");
        setTransactionDate("");
        setAccountIdFrom(null);
        setAccountIdTo(null);
        setError(null);
        setStatus("idle");
        setCashQuantities({});
    }

    function handleClose() {
        if (isBusy) return;
        resetForm();
        onClose();
    }

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        if (!isCreditPayment) {
            if (accountId === null) {
                return setError("Account is required.");
            }
            if (categoryId === null) {
                return setError("Category is required.");
            }
            if (transactionType === null) {
                return setError("Transaction Type is required.");
            }
            if (!transactionDate) {
                return setError("Transaction Date is required.");
            }

            const amount = isPhysicalCash
                ? (transactionType == TransactionTypeEnum.Income
                    ? cashTotal
                    : -cashTotal)
                : Number(initialAmount);

            if (
                !Number.isFinite(amount) ||
                amount <= 0
            ) {
                return setError("Enter an amount greater than zero.");
            }

            if (isPhysicalCash) {
                const quantities = Object.values(cashQuantities).map(Number);

                if (quantities.some(quantity => !Number.isFinite(quantity))) {
                    return setError("Invalid denomination quantity.");
                }

                if (quantities.some(quantity => !Number.isInteger(quantity))) {
                    return setError("Denomination quantities must be whole numbers.");
                }

                if (
                    transactionType === TransactionTypeEnum.Income &&
                    quantities.some(quantity => quantity < 0)
                ) {
                    return setError("Income denomination quantities cannot be negative.");
                }

                if (
                    transactionType === TransactionTypeEnum.Expense &&
                    quantities.every(quantity => quantity === 0)
                ) {
                    return setError("Enter at least one cash denomination.");
                }
            }

            const cashDenomation = denominations
                .map((denomination) => ({
                    denominationValue: denomination,
                    quantity: Number(cashQuantities[String(denomination)] || 0)
                }))
                .filter((item) => item.quantity !== 0);

            const transactionData: CreateTransactionDto = {
                accountId: accountId,
                categoryId: categoryId,
                type: transactionType,
                amount: amount,
                description: description,
                transactionDate: transactionDate,
                cashDenomation: isPhysicalCash ? cashDenomation : []
            }

            try {
                setError(null);
                setStatus("loading");

                const [result] = await Promise.allSettled([
                    onSubmitTransaction(transactionData),
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
                );

                setStatus("error");
            }
        }
        else {
            if (accountIdFrom === null) {
                return setError("Source account is required.");
            }
            if (accountIdTo === null) {
                return setError("Destination account is required.");
            }
            if (!transactionDate) {
                return setError("Transaction Date is required.");
            }

            const amount = Number(initialAmount);

            if (
                !Number.isFinite(amount) ||
                amount <= 0
            ) {
                return setError("Enter an amount greater than zero.");
            }

            const creditPaymentData: CreateCreditPaymentDto = {
                sourceAccountId: accountIdFrom,
                creditAccountId: accountIdTo,
                amount: amount,
                description: description,
                paymentDate: transactionDate
            }
            try {
                setError(null);
                setStatus("loading");

                const [result] = await Promise.allSettled([
                    onSubmitCreditPayment(creditPaymentData),
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
                );

                setStatus("error");
            }
        }

    }
    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
            onMouseDown={(e) => {
                if (e.target === e.currentTarget) handleClose();
            }}
        >
            <div className="flex max-h-[90vh] w-full max-w-2xl flex-col rounded-lg border border-border bg-card text-card-foreground">
                {status === "idle" && (
                    <form onSubmit={handleSubmit}>
                        <div className="flex flex-col gap-1 border-b border-border px-6 py-4">
                            <div className="flex flex-row items-start justify-between">
                                <div className="space-y-1">
                                    <h2 className="text-lg font-bold">
                                        Add Transaction
                                    </h2>
                                    <p className="text-sm text-muted-foreground">
                                        Record your income, expenses, or credit repayments.
                                    </p>
                                </div>
                                <button
                                    type="button"
                                    onClick={handleClose}
                                    className="rounded-md p-1.5 text-muted-foreground hover:bg-card-hover hover:text-foreground transition-colors"
                                >
                                    <X size={18} />
                                </button>
                            </div>
                            <div className="py-2">
                                <div className="grid grid-cols-3 gap-2">
                                    {[
                                        { id: 1, name: "Income", icon: TrendingUp },
                                        { id: 2, name: "Expense", icon: TrendingDown },
                                        { id: 3, name: "Credit", icon: CreditCard },
                                    ].map((item) => {
                                        const Icon = item.icon;
                                        const isSelected = transactionType === item.id;

                                        return (
                                            <button
                                                key={item.id}
                                                type="button"
                                                onClick={() => setTransactionType(item.id)}
                                                className={`
                                                    flex items-center justify-center gap-2
                                                    rounded-md border px-3 py-2
                                                    text-sm font-medium transition-colors
                                                    ${isSelected
                                                        ? "border-primary bg-primary/10 text-primary"
                                                        : "border-border text-muted-foreground hover:bg-card-hover"
                                                    }
                                                `}
                                            >
                                                <Icon size={16} />
                                                {item.name}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                        <div className="flex-1 space-y-4 overflow-y-auto px-6 py-5">
                            {isCreditPayment ? (
                                <div className="flex flex-col gap-2">
                                    <div className="space-y-4">
                                        <h3 className="text-sm font-semibold">
                                            Credit Payment Details
                                        </h3>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="min-w-0 space-y-1.5">
                                                <FormDropdown
                                                    id="account"
                                                    name="account"
                                                    label="From Account"
                                                    options={nonCreditAccounts.map((item) => ({
                                                        value: item.id,
                                                        label: item.name,
                                                    }))}
                                                    value={accountIdFrom}
                                                    onChange={setAccountIdFrom}
                                                    className={fieldClass}
                                                    placeholder="Select payment source account"
                                                />
                                            </div>
                                            <div className="min-w-0 space-y-1.5">
                                                <FormDropdown
                                                    id="account"
                                                    name="account"
                                                    label="To Account"
                                                    options={creditAccounts.map((item) => ({
                                                        value: item.id,
                                                        label: item.name,
                                                    }))}
                                                    value={accountIdTo}
                                                    onChange={setAccountIdTo}
                                                    className={fieldClass}
                                                    placeholder="Select credit card / credit account"
                                                />
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="min-w-0 space-y-1.5">
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
                                                        step="0.01"
                                                        className={`${fieldClass} pl-8 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none`}
                                                        value={initialAmount}
                                                        onChange={(e) => setInitialAmount(e.target.value)}
                                                        placeholder="0.00"
                                                    />
                                                </div>
                                            </div>
                                            <div className="min-w-0 space-y-1.5">
                                                <label htmlFor="transaction-date" className={labelClass}>
                                                    Payment Date
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
                                        </div>
                                        <div className="space-y-1.5">
                                            <label htmlFor="description" className={labelClass}>
                                                Description
                                                <span className="ml-1 font-normal text-muted-foreground">
                                                    (Optional)
                                                </span>
                                            </label>
                                            <textarea
                                                id="description"
                                                className={`${fieldClass} min-h-0 resize-none`}
                                                value={description}
                                                onChange={(e) => setDescription(e.target.value)}
                                                placeholder="Enter description."
                                                rows={1}
                                            />
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex flex-col gap-2">
                                    <div className="space-y-4">
                                        <h3 className="text-sm font-semibold">
                                            Transaction Details
                                        </h3>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="min-w-0 space-y-1.5">
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
                                            <div className="min-w-0 space-y-1.5">
                                                <FormDropdown
                                                    id="category"
                                                    name="category"
                                                    label="Category"
                                                    options={categoriesList.map((item) => ({
                                                        value: item.id,
                                                        label: item.name,
                                                    }))}
                                                    value={categoryId}
                                                    onChange={setCategoryId}
                                                    className={fieldClass}
                                                />
                                            </div>
                                        </div>

                                    </div>
                                    <div className="space-y-4">
                                        <h3 className="text-sm font-semibold">
                                            Transaction Information
                                        </h3>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="min-w-0 space-y-1.5">
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
                                            <div className="min-w-0 space-y-1.5">
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
                                                        step="0.01"
                                                        className={`${fieldClass} pl-8 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none`}
                                                        value={
                                                            isPhysicalCash
                                                                ? (transactionType === TransactionTypeEnum.Expense
                                                                    ? (cashTotal * -1).toFixed(2)
                                                                    : cashTotal.toFixed(2))
                                                                : transactionType === TransactionTypeEnum.Expense
                                                                    ? initialAmount
                                                                        ? (Math.abs(Number(initialAmount)) * -1).toString()
                                                                        : ""
                                                                    : initialAmount
                                                        }
                                                        disabled={isPhysicalCash}
                                                        readOnly={isPhysicalCash}
                                                        onChange={(e) => setInitialAmount(e.target.value)}
                                                        placeholder="0.00"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                        {isPhysicalCash && (
                                            <div className="space-y-3">
                                                <h3 className="text-sm font-semibold">
                                                    Cash Denominations
                                                </h3>

                                                <div className="grid grid-cols-5 gap-y-3 gap-x-1">
                                                    {denominations.map((denomination) => (
                                                        <div
                                                            key={denomination}
                                                            className="flex w-full items-center gap-1"
                                                        >
                                                            <label
                                                                htmlFor={`denomination-${denomination}`}
                                                                className={`${cashLabelClass} w-12 shrink-0 text-right`}
                                                            >
                                                                ₱{denomination.toLocaleString("en-PH", {
                                                                    minimumFractionDigits: denomination === 0.25 ? 2 : 0
                                                                })}:
                                                            </label>

                                                            <input
                                                                id={`denomination-${denomination}`}
                                                                type="number"
                                                                min={transactionType === TransactionTypeEnum.Income ? "0" : undefined}
                                                                step="1"
                                                                className={`${cashFieldClass} min-w-0 flex-1`}
                                                                value={cashQuantities[String(denomination)] ?? ""}
                                                                onChange={(e) =>
                                                                    handleDenominationChange(denomination, e.target.value)
                                                                }
                                                                placeholder="0"
                                                            />
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                        <div className="space-y-1.5">
                                            <label htmlFor="description" className={labelClass}>
                                                Description
                                                <span className="ml-1 font-normal text-muted-foreground">
                                                    (Optional)
                                                </span>
                                            </label>
                                            <textarea
                                                id="description"
                                                className={`${fieldClass} min-h-0 resize-none`}
                                                value={description}
                                                onChange={(e) => setDescription(e.target.value)}
                                                placeholder="Enter description."
                                                rows={1}
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                        {error && (
                            <div className="rounded-md border border-expense/30 bg-expense/5 px-3 py-2">
                                <p className="text-sm text-expense">
                                    {error}
                                </p>
                            </div>
                        )}

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
                            Transaction creation failed
                        </h2>

                        <p className="text-sm text-expense text-center">
                            {error || "Failed to create transaction."}
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