"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { updateOrderStatus } from "@/lib/orders/action";
import { OrderStatus, paymentStatusColors, PaymentStatus } from "@/lib/types/dashBoardTypes";

export interface BoardCard {
    id: string;
    description: string;
    price: number;
    dueDate: string | null;
    paymentStatus: PaymentStatus | null;
    customerName: string;
    status: OrderStatus;
}

const COLUMNS: { status: OrderStatus; label: string }[] = [
    { status: "quote_sent", label: "Quote sent" },
    { status: "approved", label: "Approved" },
    { status: "in_progress", label: "In progress" },
    { status: "delivered", label: "Delivered" },
];

function formatDueDate(dueDate: string | null) {
    if (!dueDate) return null;
    const parsed = new Date(dueDate);
    if (Number.isNaN(parsed.getTime())) return null;
    // due_date is a date-only column, so it parses as UTC midnight. Formatting it in the
    // local zone would show the previous day for anyone west of UTC.
    return parsed.toLocaleDateString(undefined, { timeZone: "UTC" });
}

export default function OrderBoard({ initialCards }: { initialCards: BoardCard[] }) {
    const [cards, setCards] = useState(initialCards);
    const [draggingId, setDraggingId] = useState<string | null>(null);
    const [dragOverColumn, setDragOverColumn] = useState<OrderStatus | null>(null);
    const [isPending, startTransition] = useTransition();

    function moveCard(id: string, nextStatus: OrderStatus) {
        const card = cards.find((item) => item.id === id);
        if (!card || card.status === nextStatus) return;

        const previousStatus = card.status;

        // Move the card immediately so the board feels instant, then reconcile with the
        // server. If the update fails we put it back where it came from.
        setCards((current) =>
            current.map((item) => (item.id === id ? { ...item, status: nextStatus } : item))
        );

        startTransition(async () => {
            const result = await updateOrderStatus(id, nextStatus);

            if (!result.success) {
                setCards((current) =>
                    current.map((item) =>
                        item.id === id ? { ...item, status: previousStatus } : item
                    )
                );
                toast.error(result.message ?? "Failed to move order.");
                return;
            }

            toast.success("Order moved.");
        });
    }

    if (cards.length === 0) {
        return (
            <p className="text-sm text-muted-foreground">
                No orders yet. Create your first order to start using the board.
            </p>
        );
    }

    return (
        <div
            className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4"
            aria-busy={isPending}
        >
            {COLUMNS.map((column) => {
                const columnCards = cards.filter((card) => card.status === column.status);
                const isDropTarget = dragOverColumn === column.status;

                return (
                    <section
                        key={column.status}
                        aria-label={column.label}
                        onDragOver={(event) => {
                            // Without preventDefault the browser refuses the drop entirely.
                            event.preventDefault();
                            setDragOverColumn(column.status);
                        }}
                        onDragLeave={() => setDragOverColumn(null)}
                        onDrop={(event) => {
                            event.preventDefault();
                            setDragOverColumn(null);
                            const id = event.dataTransfer.getData("text/plain");
                            if (id) moveCard(id, column.status);
                        }}
                        className={`rounded-xl border p-3 transition-colors min-h-64 ${
                            isDropTarget ? "border-primary bg-primary/5" : "border-border bg-muted/30"
                        }`}
                    >
                        <header className="mb-3 flex items-center justify-between">
                            <h2 className="font-heading text-sm font-semibold text-foreground">
                                {column.label}
                            </h2>
                            <span className="rounded-full bg-background px-2 py-0.5 text-xs text-muted-foreground">
                                {columnCards.length}
                            </span>
                        </header>

                        <ul className="flex flex-col gap-2">
                            {columnCards.map((card) => {
                                const due = formatDueDate(card.dueDate);

                                return (
                                    <li
                                        key={card.id}
                                        draggable
                                        onDragStart={(event) => {
                                            event.dataTransfer.setData("text/plain", card.id);
                                            event.dataTransfer.effectAllowed = "move";
                                            setDraggingId(card.id);
                                        }}
                                        onDragEnd={() => {
                                            setDraggingId(null);
                                            setDragOverColumn(null);
                                        }}
                                        className={`cursor-grab rounded-lg border border-border bg-background p-3 shadow-sm active:cursor-grabbing ${
                                            draggingId === card.id ? "opacity-50" : ""
                                        }`}
                                    >
                                        <p className="text-sm font-medium text-foreground wrap-break-word">
                                            {card.description}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            {card.customerName}
                                        </p>

                                        <div className="mt-2 flex flex-wrap items-center gap-2">
                                            <span className="text-sm font-semibold tabular-nums text-foreground">
                                                ${card.price.toFixed(2)}
                                            </span>
                                            {card.paymentStatus && (
                                                <span
                                                    className={`rounded-full px-2 py-0.5 text-[10px] font-semibold capitalize ${
                                                        paymentStatusColors[card.paymentStatus]
                                                    }`}
                                                >
                                                    {card.paymentStatus}
                                                </span>
                                            )}
                                        </div>

                                        {due && (
                                            <p className="mt-1 text-xs text-muted-foreground">
                                                Due {due}
                                            </p>
                                        )}

                                        {/* Native drag events don't fire on touch screens or for
                                            keyboard users, so the same move is available here. */}
                                        <label className="mt-2 block">
                                            <span className="sr-only">
                                                Move {card.description} to another stage
                                            </span>
                                            <select
                                                value={card.status}
                                                onChange={(event) =>
                                                    moveCard(
                                                        card.id,
                                                        event.target.value as OrderStatus
                                                    )
                                                }
                                                className="w-full rounded-md border border-border bg-background px-2 py-1 text-xs text-muted-foreground"
                                            >
                                                {COLUMNS.map((option) => (
                                                    <option
                                                        key={option.status}
                                                        value={option.status}
                                                    >
                                                        {option.label}
                                                    </option>
                                                ))}
                                            </select>
                                        </label>
                                    </li>
                                );
                            })}
                        </ul>
                    </section>
                );
            })}
        </div>
    );
}
