"use client";

import { useEffect, useState } from "react";

import { GetCategoryDetails } from "@/services/category.service";
import { formatCurrency } from "@/utils/formatCurrency";
import type { Status } from "@/types/common/submitStatus";

import { Spinner, CheckIcon, ErrorIcon } from "../common/FormSubmitIcon";
import { sleep } from "@/utils/sleep";

interface DeleteCategoryModalProps {
    selectedCategory: number | null;
    isOpen: boolean;
    onClose: () => void;
    onDelete: () => Promise<void>;
}

const fieldClass =
    "w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground " +
    "placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary";

const labelClass = "mb-1 block text-sm font-medium text-foreground";

export default function DeleteCategoryModal({
    selectedCategory,
    isOpen,
    onClose,
    onDelete
}: DeleteCategoryModalProps) {
    // Form input
    const [categoryName, setCategoryName] = useState("");
    const [description, setDescription] = useState("");
    const [type, setType] = useState<number | null>(null);
    const [transactionCount, setTransactionCount] = useState<number>(0);
    const [totalAmount, setTotalAmount] = useState<number>(0);

    const [deleteConfirmation, setDeleteConfirmation] = useState("");

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
        setError(null);
        setDeleteConfirmation("");
        setStatus("idle");
    }

    function handleClose() {
        if (isBusy) return;
        resetForm();
        onClose();
    }

    async function handleDelete() {
        if (!deleteConfirmation) {
            return;
        }

        try {
            setError(null);
            setStatus("loading");
            await sleep(1000);

            await onDelete();

            setStatus("success");
            await sleep(1000);

            resetForm();
            onClose();
        } catch (error) {
            setError(
                error instanceof Error
                    ? error.message
                    : "Failed to delete account."
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
                    <div
                        className="fixed inset-0 z-60 flex items-center justify-center bg-black/60 p-4"
                        onMouseDown={(e) => {
                            if (e.target === e.currentTarget) {
                                onClose();
                                setDeleteConfirmation("");
                            }
                        }}
                    >
                        <div className="w-full max-w-sm rounded-lg border border-border bg-card p-6 text-card-foreground shadow-xl">

                            <h2 className="text-lg font-bold">
                                Delete Category?
                            </h2>

                            <p className="mt-2 text-sm text-muted-foreground">
                                Are you sure you want to delete this category?
                                This action cannot be undone.
                            </p>

                            <div className="mt-4 rounded-md border border-border p-4 space-y-4 text-sm">
                                <div className="flex items-center justify-between gap-4">
                                    <span className="text-muted-foreground shrink-0">
                                        Account
                                    </span>
                                    <span className="font-medium text-right">
                                        {categoryName ?? "N/A"}
                                    </span>
                                </div>

                                <div className="flex items-center justify-between gap-4">
                                    <span className="text-muted-foreground">
                                        Number of Transactions
                                    </span>
                                    <span className="font-medium">
                                        {transactionCount ?? 0}
                                    </span>
                                </div>

                                <div className="flex items-center justify-between gap-4">
                                    <span className="text-muted-foreground">
                                        Amount
                                    </span>
                                    <span className={`
                                        font-semibold
                                        ${type === 1
                                            ? "text-income"
                                            : "text-expense"
                                        }
                                    `}> 
                                        {formatCurrency(totalAmount ?? 0)}
                                    </span>
                                </div>

                                <div className="space-y-2">
                                    <span className="text-muted-foreground">
                                        Description
                                    </span>

                                    <p className="
                                        rounded-md py-1
                                        text-sm text-foreground leading-relaxed
                                        whitespace-pre-wrap wrap-break-word
                                    ">
                                        {description?.trim() || "No description provided."}
                                    </p>
                                </div>
                            </div>

                            <div className="mt-4">
                                <label
                                    htmlFor="delete-account-confirmation"
                                    className={labelClass}
                                >
                                    Type <span className="font-bold text-foreground">DELETE</span> to confirm.
                                </label>
                                <input
                                    id="delete-account-confirmation"
                                    type="text"
                                    className={fieldClass}
                                    value={deleteConfirmation}
                                    onChange={(e) => setDeleteConfirmation(e.target.value)}
                                    placeholder="Enter DELETE to confirm"
                                    autoComplete="off"
                                />
                            </div>

                            <div className="mt-6 flex justify-end gap-3">

                                <button
                                    type="button"
                                    onClick={() => handleClose()}
                                    className="rounded-md border border-border px-4 py-2 text-sm font-medium hover:bg-card-hover transition-colors"
                                >
                                    Cancel
                                </button>

                                <button
                                    type="button"
                                    onClick={handleDelete}
                                    disabled={deleteConfirmation !== "DELETE"}
                                    className="rounded-md bg-account-card-1-foreground px-4 py-2 text-sm font-medium text-white hover:opacity-90 transition-opacity disabled:cursor-not-allowed disabled:opacity-40"
                                >
                                    Yes, Delete
                                </button>

                            </div>
                        </div>
                    </div>
                )}
                {status === "loading" && (
                    <div className="flex flex-col items-center justify-center gap-3 px-6 py-12">
                        <Spinner />

                        <h2 className="text-lg font-bold">
                            Deleting category...
                        </h2>

                        <p className="text-sm text-muted-foreground text-center">
                            Please wait while we delete your category.
                        </p>
                    </div>
                )}

                {status === "success" && (
                    <div className="flex flex-col items-center justify-center gap-3 px-6 py-12">
                        <CheckIcon />

                        <h2 className="text-lg font-bold">
                            Category removed!
                        </h2>

                        <p className="text-sm text-muted-foreground text-center">
                            Your category has been successfully removed.
                        </p>
                    </div>
                )}

                {status === "error" && (
                    <div className="flex flex-col items-center justify-center gap-3 px-6 py-12">
                        <ErrorIcon />

                        <h2 className="text-lg font-bold">
                            Category deletion failed
                        </h2>

                        <p className="text-sm text-expense text-center">
                            {error || "Failed to delete category."}
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