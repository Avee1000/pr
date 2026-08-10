'use client'

import { useState, useEffect, useTransition, useCallback } from "react"; 
import { X, User, Calendar, DollarSign, FileText, Copy, CheckCircle2, RefreshCw } from 'lucide-react'
import { OrderRowsProps, orderStatusColors, paymentStatusColors } from '@/lib/supabase/types'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { shareToken } from '@/lib/orders/quotes/action'
import { LoadingState } from '@/components/feedback/loading-state'
import { Alert } from '@/components/feedback/alert'
import Information from "@/components/Information";

interface ViewSingleOrderProps {
    orderData: OrderRowsProps | null;
    isOpen: boolean;
    onClose: () => void;
}

// Fixed: Component capitalized and converted to a valid React Functional Component
export function QuoteLinkGenerator({ orderId }: { orderId: string }) {
  const [link, setLink] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [expiry, setExpiry] = useState<Date | null>(null);


  // 1. Extract generation logic into a reusable callback
  const generateLink = useCallback(() => {
    startTransition(async () => {
      setError(null);
      const result = await shareToken(orderId);
      if ("error" in result) {
        setError(result.error);
        return;
      }
      setLink(`${window.location.origin}/quote/${result.token}`);
      setExpiry(new Date(result.expiresAt))
    });
  }, [orderId]);

  // 2. Trigger initial load on mount or when orderId changes
  useEffect(() => {
    generateLink();
  }, [generateLink]);

  const handleCopy = () => {
    if (!link) return;
    navigator.clipboard.writeText(link);
    setCopied(true);
    toast("Quote link copied to clipboard!", {
      duration: 1500,
      icon: <CheckCircle2 className="size-4" />,
    });
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="pt-2">
      {isPending && !link ? (
        <LoadingState iconClassName='text-ink' className='p-0 [all:unset]'/>
      ) : error ? (
        <div className="flex flex-col items-center gap-2">
          <Alert variant='warning' className="flex-1">{error} or try refreshing.</Alert>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={generateLink}
            disabled={isPending}
            className="h-8 shrink-0 gap-1.5 "
          >
            <RefreshCw className={`size-3.5 ${isPending ? 'animate-spin' : ''}`} />Refresh
          </Button>
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <input
            readOnly
            value={link || ''}
            className="h-8 text-xs w-full px-2 rounded-md border border-input bg-background font-mono select-all focus:outline-none"
          />
          {/* Copy Button */}
          <Button
            type="button"
            size="sm"
            onClick={handleCopy}
            className="h-8 shrink-0 gap-1.5"
            disabled={!link || isPending}
          >
            <Copy className="size-3.5" />
            <span className="text-xs">{copied ? "Copied" : "Copy"}</span>
          </Button>
        </div>
      )}
      <div>
        {expiry && 
        <p className="text-xs text-muted-foreground mt-2">
          Link expires: {expiry.toLocaleString()} <Information detail="Links become inactive after expiry"/>
        </p>}
      </div>
    </div>
  );
}

export default function ViewSingleOrder({ orderData, isOpen, onClose }: ViewSingleOrderProps) {
    const [activeOrder, setActiveOrder] = useState<OrderRowsProps | null>(orderData);

    useEffect(() => {
        if (orderData) {
            setActiveOrder(orderData);
        }
    }, [orderData]);

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [isOpen]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isOpen) {
                onClose();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, onClose]);

    if (!activeOrder) return null;

    const { allOrders: order, customer } = activeOrder;

    return (
        <>
            {/* Backdrop Overlay */}
            <div
                onClick={onClose}
                className={`fixed inset-0 bg-black/40 z-40 transition-opacity duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] transform-gpu ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
                    }`}
                aria-hidden="true"
            />

            {/* Slide-over Drawer Panel */}
            <aside
                id={`order-drawer-${order.id}`}
                role="dialog"
                aria-label="Order Details Panel"
                aria-hidden={!isOpen}
                className={`fixed top-0 bottom-0 right-0 z-50 m-1 ml-0 w-80 sm:w-96 rounded-2xl bg-white dark:bg-zinc-900 border-l border-border shadow-2xl transition-transform duration-400 ease-[cubic-bezier(0.16,1,0.3,1)] transform-gpu will-change-transform flex flex-col ${isOpen ? 'translate-x-0' : 'translate-x-[101%]'
                    }`}
            >
                {/* Panel Header */}
                <div className="flex items-center justify-between p-4 border-b border-border">
                    <div>
                        <h3 className="font-semibold text-base text-ink dark:text-white">
                            Order Details
                        </h3>
                        <div className="flex flex-row group items-center gap-1">
                            <p className="text-xs text-muted-foreground font-mono">ID: {order.id}</p>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => {
                                    navigator.clipboard.writeText(order.id);
                                    toast("Order ID copied to clipboard!", {
                                        duration: 1000,
                                        icon: <CheckCircle2 className="size-4" />,
                                    });
                                }}
                                className="size-4 text-muted-foreground hover:text-foreground"
                                title="Copy Order ID"
                            >
                                <Copy className="size-3.5" />
                            </Button>
                        </div>
                    </div>
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={onClose}
                        className="size-8 rounded-md"
                        aria-label="Close panel"
                    >
                        <X className="size-4" />
                    </Button>
                </div>

                {/* Order Details Body */}
                <div className="flex-1 overflow-y-auto p-5 space-y-6 text-left">
                    {/* Status Badges */}
                    <div className="flex items-center gap-2">
                        <span
                            className={`px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${orderStatusColors[order.status] || 'bg-gray-500/20 text-gray-700'
                                }`}
                        >
                            {order.status?.replace('_', ' ')}
                        </span>
                        <span
                            className={`px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${order.payment_status
                                    ? paymentStatusColors[order.payment_status]
                                    : 'bg-gray-500/20 text-gray-700'
                                }`}
                        >
                            {order.payment_status?.replace('_', ' ') || 'N/A'}
                        </span>
                    </div>

                    {/* Customer Details */}
                    <div className="space-y-2 p-3 rounded-xl bg-muted/40 border border-border">
                        <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                            <User className="size-3.5" />
                            <span>Customer</span>
                        </div>
                        <div>
                            <p className="font-semibold text-sm text-foreground">{customer?.name || 'N/A'}</p>
                            {customer?.email && <p className="text-xs text-muted-foreground">{customer.email}</p>}
                        </div>
                    </div>

                    {/* Price Details */}
                    <div className="space-y-1 p-3 rounded-xl bg-muted/40 border border-border">
                        <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                            <DollarSign className="size-3.5" />
                            <span>Amount</span>
                        </div>
                        <p className="text-lg font-bold text-foreground">${order.price?.toFixed(2)}</p>
                    </div>

                    {/* Description */}
                    <div className="space-y-1.5 bg-muted/20 p-3 rounded-xl border border-border">
                        <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                            <FileText className="size-3.5" />
                            <span>Description</span>
                        </div>
                        <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap wrap-break-word">
                            {order.description || 'No description provided.'}
                        </p>
                    </div>

                    {/* Dates */}
                    <div className="space-y-3 pt-5 border-t border-border">
                        <div className="flex items-center justify-between text-xs">
                            <span className="flex items-center gap-1.5 text-muted-foreground">
                                <Calendar className="size-3.5" /> Due Date
                            </span>
                            <span className="font-medium text-foreground">{order.due_date || 'N/A'}</span>
                        </div>
                        <div className="flex items-center justify-between text-xs">
                            <span className="flex items-center gap-1.5 text-muted-foreground">
                                <Calendar className="size-3.5" /> Created At
                            </span>
                            <span className="font-medium text-foreground">
                                {order.created_at ? new Date(order.created_at).toLocaleDateString('en-US') : 'N/A'}
                            </span>
                        </div>
                    </div>

                    <QuoteLinkGenerator orderId={order.id} />
                </div>
            </aside>
        </>
    );
}