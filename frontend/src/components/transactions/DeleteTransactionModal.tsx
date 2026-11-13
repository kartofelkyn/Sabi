"use client";

import { useEffect, useState } from "react";

import { getTransaction } from "@/services/transaction.service";

import type { DeleteTransactionDto } from "@/types/transaction/DeleteTransactionDto";
import type { Status } from "@/types/common/submitStatus";
import type { SelectedTransactionDto } from "@/types/transaction/SelectedTransactionDto";
import type { AccountsDropdown, CategoriesDropdown } from "@/types/common/dropdown";
import { transactionTypeOptions } from "@/constants/transactions/transaction-type-options";

import FormDropdown from "../common/FormDropdown";
import { Spinner, CheckIcon, ErrorIcon } from "../common/FormSubmitIcon";
import { sleep } from "@/utils/sleep";
import { Transaction } from "@/types/transaction/Transaction";


interface DeleteTransactionModalProps {
    selectedTransaction: SelectedTransactionDto | null;
    isOpen: boolean;
    onClose: () => void;
    onDelete: () => Promise<void>;
}

const fieldClass =
    "w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground " +
    "placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary";

const labelClass = "mb-1 block text-sm font-medium text-foreground";

export default function DeleteTransactionModal({
    selectedTransaction,
    isOpen,
    onClose,
    onDelete
}: DeleteTransactionModalProps) {

    // Form input
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
                                Delete Account?
                            </h2>

                            <p className="mt-2 text-sm text-muted-foreground">
                                Are you sure you want to delete this transaction?
                                This action cannot be undone.
                            </p>

                            <div className="mt-4 rounded-md border p-3 space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Account</span>
                                    <span>{selectedTransaction?.accountName ?? "N/A"}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Category</span>
                                    <span>{selectedTransaction?.categoryName ?? "N/A"}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Type</span>
                                    <span>{selectedTransaction?.transactionType ?? "N/A"}</span>
                                </div>

                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Description</span>
                                    <span className="text-right">
                                        {selectedTransaction?.description || "No description"}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Amount</span>
                                    <span
                                        className={`
                                            selectedTransaction?.transactionType === "Income"
                                                ? "text-income"
                                                : "text-expense" 
                                            font-semibold    
                                            `
                                        }
                                    >
                                        ₱ {selectedTransaction?.amount.toLocaleString("en-PH", {
                                            minimumFractionDigits: 2,
                                            maximumFractionDigits: 2,
                                        }) ?? "0.00"}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Date</span>
                                    <span>{selectedTransaction?.transactionDate.split("T")[0] ?? "N/A"}</span>
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
                            Deleting Transaction...
                        </h2>

                        <p className="text-sm text-muted-foreground text-center">
                            Please wait while we delete your transaction.
                        </p>
                    </div>
                )}

                {status === "success" && (
                    <div className="flex flex-col items-center justify-center gap-3 px-6 py-12">
                        <CheckIcon />

                        <h2 className="text-lg font-bold">
                            Transaction removed!
                        </h2>

                        <p className="text-sm text-muted-foreground text-center">
                            Your transaction has been successfully removed.
                        </p>
                    </div>
                )}

                {status === "error" && (
                    <div className="flex flex-col items-center justify-center gap-3 px-6 py-12">
                        <ErrorIcon />

                        <h2 className="text-lg font-bold">
                            Delete failed
                        </h2>

                        <p className="text-sm text-expense text-center">
                            Failed to delete transaction.
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