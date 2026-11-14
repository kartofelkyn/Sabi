"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import DynamicIcon from "../common/DynamicIcon";

import type { Status } from "@/types/common/submitStatus";
import type { CreateCategoryDto } from "@/types/category/CreateCategoryDto";
import { transactionTypeOptions } from "@/constants/transactions/transaction-type-options";

import FormDropdown from "../common/FormDropdown";
import { Spinner, CheckIcon, ErrorIcon } from "../common/FormSubmitIcon";
import { sleep } from "@/utils/sleep";

interface AddCategoryModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (category: CreateCategoryDto) => Promise<void>;
}

const fieldClass =
    "w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground " +
    "placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary";

const labelClass = "mb-1 block text-sm font-medium text-foreground";

export default function AddCategoryModal({
    isOpen,
    onClose,
    onSubmit
}: AddCategoryModalProps) {
    // Form input
    const [categoryName, setCategoryName] = useState("");
    const [description, setDescription] = useState("");
    const [icon, setIcon] = useState("");
    const [type, setType] = useState<number | null>(null);

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
        setCategoryName("");
        setDescription("")
        setIcon("");
        setType(null);
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

        if (categoryName == null) {
            return setError("Category Name is required.");
        }

        if (type == null) {
            return setError("Category type is required.");
        }

        const categoryData: CreateCategoryDto = {
            name: categoryName,
            description: description,
            icon: icon,
            type: type
        }

        try {
            setError(null);
            setStatus("loading");

            const [result] = await Promise.allSettled([
                onSubmit(categoryData),
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

                        <div className="flex items-start justify-between border-b border-border px-6 py-5">
                            <div className="space-y-1">
                                <h2 className="text-lg font-semibold">
                                    Add Category
                                </h2>
                                <p className="text-sm text-muted-foreground">
                                    Create a category to organize your transactions.
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

                        <div className="flex flex-col gap-5 px-6 py-6">

                            <div className="space-y-4">
                                <h3 className="text-sm font-semibold">
                                    Basic Information
                                </h3>

                                <div className="space-y-1.5">
                                    <label htmlFor="name" className={labelClass}>
                                        Category Name
                                    </label>

                                    <input
                                        id="name"
                                        type="text"
                                        className={fieldClass}
                                        value={categoryName}
                                        onChange={(e) => setCategoryName(e.target.value)}
                                        placeholder="e.g. Groceries"
                                        required
                                        maxLength={100}
                                    />
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
                                        className={`${fieldClass} min-h-20 resize-none`}
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        placeholder="Describe what this category is for."
                                        rows={3}
                                    />
                                </div>
                            </div>

                            <div className="space-y-4">
                                <h3 className="text-sm font-semibold">
                                    Appearance & Type
                                </h3>

                                <div className="grid grid-cols-2 gap-4">

                                    <div className="min-w-0 space-y-1.5">
                                        <label htmlFor="icon" className={labelClass}>
                                            Category Icon
                                        </label>

                                        <div className="flex items-center gap-2">
                                            <input
                                                id="icon"
                                                type="text"
                                                className={`${fieldClass} min-w-0`}
                                                value={icon}
                                                onChange={(e) => setIcon(e.target.value)}
                                                placeholder="e.g. utensils"
                                            />

                                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-border bg-background">
                                                <DynamicIcon
                                                    name={icon || "shapes"}
                                                    size={20}
                                                    className="text-primary"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="min-w-0 space-y-1.5">
                                        <FormDropdown
                                            id="transaction-type"
                                            name="TransactionType"
                                            label="Transaction Type"
                                            options={transactionTypeOptions.map((item) => ({
                                                value: item.id,
                                                label: item.name,
                                            }))}
                                            value={type}
                                            onChange={setType}
                                            className={fieldClass}
                                        />
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

                        <div className="flex justify-end gap-3 border-t border-border bg-background/50 px-6 py-4">
                            <button
                                type="button"
                                onClick={handleClose}
                                className="rounded-md border border-border px-4 py-2 text-sm font-medium hover:bg-card-hover transition-colors"
                            >
                                Cancel
                            </button>

                            <button
                                type="submit"
                                className="rounded-md bg-primary px-5 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 transition-opacity"
                            >
                                Create Category
                            </button>
                        </div>
                    </form>
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