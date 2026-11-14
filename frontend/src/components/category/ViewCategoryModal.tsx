"use client";

import { useEffect, useState } from "react";
import { X, Receipt, Wallet } from "lucide-react";
import DynamicIcon from "../common/DynamicIcon";

import type { Status } from "@/types/common/submitStatus";

import { Spinner, CheckIcon, ErrorIcon } from "../common/FormSubmitIcon";
import { GetCategoryDetails } from "@/services/category.service";
import { sleep } from "@/utils/sleep";

interface ViewCategoryModalProps {
    selectedCategory: number | null;
    isOpen: boolean;
    onClose: () => void;
}

const fieldClass =
    "w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground " +
    "placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary";

const labelClass = "mb-1 block text-sm font-medium text-foreground";

export default function ViewCategoryModal({
    selectedCategory,
    isOpen,
    onClose,
}: ViewCategoryModalProps) {
    // Form
    const [categoryName, setCategoryName] = useState("");
    const [type, setType] = useState<number | null>(null);
    const [description, setDescription] = useState("");
    const [icon, setIcon] = useState("");
    const [transactionCount, setTransactionCount] = useState<number>(0);
    const [totalAmount, setTotalAmount] = useState<number>(0);

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

    useEffect(() => {

        let isActive = true;

        async function loadCategory() {
            try {
                if (selectedCategory == null || selectedCategory < 0) {
                    setError("Category doesnt exist");
                    setStatus("error");
                    sleep(1000);

                    return;
                }

                resetForm();
                setError(null)
                setStatus("loading");

                const data = await GetCategoryDetails(selectedCategory);

                if (isActive) {
                    setCategoryName(data.name);
                    setDescription(data.description);
                    setType(data.type);
                    setIcon(data.icon);
                    setTransactionCount(data.transactionCount);
                    setTotalAmount(data.totalAmount);
                }
            } catch (error) {
                if (isActive) {
                    setError(
                        error instanceof Error
                            ? error.message
                            : "Failed to load categories."
                    )
                }
            } finally {
                if (isActive) {
                    setStatus("idle");
                }
            }
        }

        loadCategory();

        return () => {
            isActive = false;
        }
    }, [isOpen])
    if (!isOpen) return null;

    function resetForm() {
        setCategoryName("");
        setDescription("")
        setIcon("");
        setType(null);
        setTransactionCount(0);
        setTotalAmount(0);
        setError(null);
        setStatus("idle");
    }

    function handleClose() {
        if (isBusy) return;

        resetForm();
        onClose();
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
                    <div>
                        <div className="flex items-start justify-between border-b border-border px-6 py-5">
                            <div className="space-y-1">
                                <h2 className="text-lg font-semibold">
                                    Category Details
                                </h2>
                                <p className="text-sm text-muted-foreground">
                                    View detailed information about this category.
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

                        <div className="flex flex-col gap-6 px-6 py-6">

                            <div className="flex items-center gap-4">
                                <div
                                    className={`
                                        flex h-16 w-16 shrink-0 items-center justify-center
                                        rounded-xl
                                        ${type === 1
                                            ? "bg-income/10 text-income"
                                            : "bg-expense/10 text-expense"
                                        }
                                    `}
                                >
                                    <DynamicIcon
                                        name={icon || "shapes"}
                                        size={30}
                                    />
                                </div>

                                <div className="min-w-0 flex-1 space-y-1">
                                    <h3 className="text-xl font-semibold text-foreground truncate">
                                        {categoryName || "Unknown Category"}
                                    </h3>

                                    <div className="flex items-center gap-2">
                                        <span
                                            className={`
                                            inline-flex items-center rounded-full px-2.5 py-1
                                            text-xs font-medium
                                            ${type === 1
                                                    ? "bg-income/10 text-income"
                                                    : "bg-expense/10 text-expense"
                                                }
                                        `}
                                        >
                                            {type === 1 ? "Income" : "Expense"}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4">


                                <div className="space-y-1.5">
                                    <label className={labelClass}>
                                        Description
                                    </label>
                                    <p className={`${fieldClass} w-full block min-h-20 whitespace-pre-wrap`}>
                                        {description || "No description provided."}
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <h3 className="text-sm font-semibold">
                                    Transaction Overview
                                </h3>

                                <div className="grid grid-cols-[45%_55%] gap-3">

                                    <div className="rounded-lg flex flex-row gap-4 items-center border border-border bg-card-secondary p-4">
                                        <Receipt
                                            size={20}
                                            className="text-muted-foreground"
                                        />
                                        <div>
                                            <p className="text-xl font-semibold text-foreground">
                                                {transactionCount ?? 0}
                                            </p>

                                            <p className="text-xs text-muted-foreground">
                                                Total Transactions
                                            </p>
                                        </div>

                                    </div>

                                    <div className="rounded-lg flex flex-row gap-4 items-center border border-border bg-card-secondary p-4">
                                        <Wallet
                                            size={35}
                                            className="text-muted-foreground"
                                        />
                                        <div>
                                            <p className="text-xl font-semibold text-foreground">
                                                {new Intl.NumberFormat("en-PH", {
                                                    style: "currency",
                                                    currency: "PHP",
                                                }).format(totalAmount ?? 0)}
                                            </p>

                                            <p className="text-sm text-muted-foreground">
                                                Total Amount
                                            </p>
                                        </div>

                                    </div>

                                </div>
                            </div>

                            {error && (
                                <div className="rounded-md border border-expense/30 bg-expense/5 px-3 py-2">
                                    <p className="text-sm text-expense">
                                        {error}
                                    </p>
                                </div>
                            )}

                        </div>

                        <div className="flex justify-end border-t border-border bg-background/50 px-6 py-4">
                            <button
                                type="button"
                                onClick={handleClose}
                                className="rounded-md border border-border px-5 py-2 text-sm font-medium hover:bg-card-hover transition-colors"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                )}
                {status === "loading" && (
                    <div className="flex flex-col items-center justify-center gap-3 px-6 py-12">
                        <Spinner />

                        <h2 className="text-lg font-bold">
                            Creating Category...
                        </h2>

                        <p className="text-sm text-muted-foreground text-center">
                            Please wait while we create your category.
                        </p>
                    </div>
                )}

                {status === "success" && (
                    <div className="flex flex-col items-center justify-center gap-3 px-6 py-12">
                        <CheckIcon />

                        <h2 className="text-lg font-bold">
                            Category created!
                        </h2>

                        <p className="text-sm text-muted-foreground text-center">
                            Your category has been successfully created.
                        </p>
                    </div>
                )}

                {status === "error" && (
                    <div className="flex flex-col items-center justify-center gap-3 px-6 py-12">
                        <ErrorIcon />

                        <h2 className="text-lg font-bold">
                            Category creation failed
                        </h2>

                        <p className="text-sm text-expense text-center">
                            {error || "Failed to create category."}
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