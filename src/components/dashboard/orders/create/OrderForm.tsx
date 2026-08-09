"use client";

import Link from "next/link";
import { useState, useActionState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { AlertCircle, Calendar as CalendarIcon, Check, ChevronsUpDown, DollarSign, FileText, User, Loader, Tag, CreditCard, Plus, Wrench, Clock3, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { createOrder, OrderState } from "@/lib/orders/action";
import { Calendar } from "@/components/ui/calendar"
import { format } from 'date-fns'
import type { LaborCost, Material, TargetProfit } from "@/lib/supabase/types";


interface Customer {
  id: string;
  name: string;
  email: string | null;
}

interface PricingSheet {
  id: string;
  name: string;
  suggested_price: number | null;
}

type MaterialSelectionRow = {
  material_cost_id: string;
  quantity: string;
};

interface OrderFormProps {
  customers: Customer[];
  materials: Material[];
  laborCost: LaborCost | null;
  targetProfit: TargetProfit | null;
  pricingSheets?: PricingSheet[];
}

function roundCurrency(value: number) {
  return Number(value.toFixed(2));
}

export default function OrderForm({ customers, materials, laborCost, targetProfit, pricingSheets }: OrderFormProps) {
  const router = useRouter();
  const [customerId, setCustomerId] = useState("");
  const [customerOpen, setCustomerOpen] = useState(false);
  const [pricingSheetId, setPricingSheetId] = useState<string | null>(null);
  const [description, setDescription] = useState("");
  const [materialsUsed, setMaterialsUsed] = useState<MaterialSelectionRow[]>([
    { material_cost_id: "", quantity: "1" },
  ]);
  const [estimatedHours, setEstimatedHours] = useState("0");
  const [dueDate, setDueDate] = useState<Date | undefined>(new Date());
  const [status, setStatus] = useState("quote_sent");
  const [paymentStatus, setPaymentStatus] = useState("pending");

  const materialById = useMemo(
    () => new Map(materials.map((material) => [material.id, material])),
    [materials]
  );

  const selectedMaterialRows = useMemo(
    () => materialsUsed.filter((item) => item.material_cost_id && Number(item.quantity) > 0),
    [materialsUsed]
  );

  const materialsSubtotal = useMemo(() => {
    return roundCurrency(
      selectedMaterialRows.reduce((sum, row) => {
        const material = materialById.get(row.material_cost_id);
        if (!material) return sum;
        return sum + material.value * Number(row.quantity);
      }, 0)
    );
  }, [materialById, selectedMaterialRows]);

  const estimatedHoursNumber = Number(estimatedHours || "0");
  const hourlyRate = laborCost?.hourly_rate ?? 0;
  const laborSubtotal = roundCurrency(estimatedHoursNumber * hourlyRate);
  const subtotal = roundCurrency(materialsSubtotal + laborSubtotal);
  const profitPercent = targetProfit?.profit_percent ?? 0;
  const computedTotalPrice = roundCurrency(subtotal * (1 + profitPercent / 100));

  const missingLaborCost = !laborCost;
  const missingTargetProfit = !targetProfit;
  const hasAtLeastOneMaterial = selectedMaterialRows.length > 0;
  const canSubmit = !missingLaborCost && !missingTargetProfit && hasAtLeastOneMaterial && computedTotalPrice > 0;

  const initialState: OrderState = { message: null, errors: {} };
  const [state, formAction, isPending] = useActionState(async (prevState: OrderState, formData: FormData) => {
    formData.append("customer_id", customerId);
    formData.append("status", status);
    formData.append("description", description);
    formData.append("price", computedTotalPrice.toString());
    formData.append("estimated_hours", estimatedHoursNumber.toString());
    formData.append("materials_payload", JSON.stringify(selectedMaterialRows));
    formData.append("payment_status", paymentStatus);
    if (dueDate) {
      formData.append("due_date", dueDate.toISOString());
    }
    if (pricingSheetId) {
      formData.append("pricing_sheet_id", pricingSheetId);
    }
    const result = await createOrder(prevState, formData);
    if (result.success) {
      setCustomerId("");
      setPricingSheetId(null);
      setDescription("");
      setMaterialsUsed([{ material_cost_id: "", quantity: "1" }]);
      setEstimatedHours("0");
      setDueDate(undefined);
      setStatus("quote_sent");
      setPaymentStatus("pending");
      router.refresh();
    }
    return result;
  }, initialState);

  useEffect(() => {
    if (state.success) {
      toast.success("Order created successfully!");
    } else if (state.message && !state.success) {
      toast.error(state.message);
    }
  }, [state]);

  const selectedCustomer = customers.find((c) => c.id === customerId);
  const handlePricingSheetSelect = (sheetId: string) => {
    setPricingSheetId(sheetId);
    if (!sheetId || !pricingSheets) return;
  };

  const addMaterialRow = () => {
    setMaterialsUsed((prev) => [...prev, { material_cost_id: "", quantity: "1" }]);
  };

  const removeMaterialRow = (index: number) => {
    setMaterialsUsed((prev) => {
      if (prev.length === 1) {
        return [{ material_cost_id: "", quantity: "1" }];
      }
      return prev.filter((_, rowIndex) => rowIndex !== index);
    });
  };

  const updateMaterialRow = (index: number, value: Partial<MaterialSelectionRow>) => {
    setMaterialsUsed((prev) =>
      prev.map((row, rowIndex) =>
        rowIndex === index
          ? {
              ...row,
              ...value,
            }
          : row
      )
    );
  };

  // const handleSubmit = async (e: React.FormEvent) => {
  //   e.preventDefault();
  //   setIsLoading(true);
  //   setErrorMessage(null);

  //   if (!customerId) {
  //     setErrorMessage("Please select a customer for this order.");
  //     setIsLoading(false);
  //     return;
  //   }
  //   if (!description.trim()) {
  //     setErrorMessage("Please provide a description of the work.");
  //     setIsLoading(false);
  //     return;
  //   }
  //   if (!price || Number(price) <= 0) {
  //     setErrorMessage("Please enter a valid price greater than zero.");
  //     setIsLoading(false);
  //     return;
  //   }
  //   if (!dueDate) {
  //     setErrorMessage("Please select a target due date.");
  //     setIsLoading(false);
  //     return;
  //   }

  //   try {
  //     const response = await fetch("/api/orders", {
  //       method: "POST",
  //       headers: { "Content-Type": "application/json" },
  //       body: JSON.stringify({
  //         customer_id: customerId,
  //         description: description.trim(),
  //         price: parseFloat(price),
  //         due_date: dueDate,
  //         status,
  //         payment_status: paymentStatus,
  //       }),
  //     });

  //     if (!response.ok) {
  //       const errorData = await response.json();
  //       throw new Error(errorData.message || "Failed to create order.");
  //     }

  //     router.push("/dashboard");
  //     router.refresh();
  //   } catch (err: unknown) {
  //     if (err instanceof Error) {
  //       setErrorMessage(err.message);
  //     } else {
  //       setErrorMessage("An unexpected error occurred. Please try again.");
  //     }
  //   } finally {
  //     setIsLoading(false);
  //   }
  // };

  return (
    <form action={formAction} className="space-y-6 max-w-7xl mx-auto">
      {/* {errorMessage && (
        <div className="flex items-center gap-3 rounded-xl border border-red-600/25 bg-red-50 px-4 py-3.5 text-sm text-red-600 shadow-sm animate-in fade-in-50">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <span className="font-medium">{errorMessage}</span>
        </div>
      )} */}

      {/* Section 1: Client & Pricing Template */}
      <div className="rounded-2xl border border-border bg-card p-6 shadow-xs space-y-5">
        <div className="border-b border-border pb-4">
          <h3 className="text-base font-semibold text-foreground">Client & Template Information</h3>
          <p className="text-xs text-muted-foreground mt-0.5">Select the client for this order and optionally apply a preset pricing model.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="space-y-2 flex flex-col">
            <label className="text-xs font-semibold uppercase text-muted-foreground flex items-center gap-1.5">
              <User className="h-3.5 w-3.5" />
              Customer <span className="text-red-600">*</span>
            </label>
            <Popover open={customerOpen} onOpenChange={setCustomerOpen}>
              <PopoverTrigger render={
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={customerOpen}
                  className="w-full justify-between rounded-xl border-border bg-white px-3.5 text-sm font-normal shadow-xs transition-all hover:bg-muted/50 focus:border-ring focus:ring-2 focus:ring-ring/20"
                >
                  <span className="truncate">
                    {selectedCustomer
                      ? `${selectedCustomer.name} ${selectedCustomer.email ? `(${selectedCustomer.email})` : ""}`
                      : "Search or select a customer..."}
                  </span>
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>}>
              </PopoverTrigger>
              <PopoverContent className="w-(--radix-popover-content-width) p-0 rounded-xl shadow-lg border-border">
                <Command>
                  <CommandInput placeholder="Search customer by name or email..." className="h-10 text-sm" />
                  <CommandList>
                    <CommandEmpty className="px-1 text-xs text-muted-foreground">
                      {customers.length === 0 ? "No customers found. Add one first." : "No matching customer found."}
                    </CommandEmpty>
                    <CommandGroup>
                      {customers.map((customer) => (
                        <CommandItem
                          key={customer.id}
                          value={`${customer.name} ${customer.email || ""}`}
                          onSelect={() => {
                            setCustomerId(customer.id);
                            setCustomerOpen(false);
                          }}
                          className="cursor-pointer text-sm py-2.5"
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              customerId === customer.id ? "opacity-100 text-brand" : "opacity-0"
                            )}
                          />
                          <div className="flex flex-col">
                            <span className="font-medium text-foreground">{customer.name}</span>
                            {customer.email && <span className="text-xs text-muted-foreground">{customer.email}</span>}
                          </div>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
            {state.errors?.customer_id && (
              <p className="text-xs text-red-600">{state.errors.customer_id[0]}</p>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase text-muted-foreground flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <FileText className="h-3.5 w-3.5" />
                Pricing Sheet Template
              </span>
              <span className="text-xs font-normal lowercase text-muted-foreground">Optional</span>
            </label>
            <Select value={pricingSheetId || undefined} onValueChange={(value) => handlePricingSheetSelect(value || "")} modal={false}>
              <SelectTrigger aria-expanded={false} className="h-11 w-full rounded-xl border-border bg-white pl-3.5 text-sm shadow-xs transition-all hover:bg-muted/50 focus:border-ring focus:ring-2 focus:ring-ring/20">
                <SelectValue placeholder="Load from pricing model..." />
              </SelectTrigger>
              <SelectContent className="rounded-xl border-border shadow-lg">
                {pricingSheets && pricingSheets.map((sheet) => (
                  <SelectItem key={sheet.id} value={sheet.id} className="cursor-pointer">
                    {sheet.name} {sheet.suggested_price ? `• Ref: $${sheet.suggested_price}` : ""}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Section 2: Project Scope & Description */}
      <div className="rounded-2xl border border-border bg-card p-6 shadow-xs space-y-5">
        <div className="border-b border-border pb-4">
          <h3 className="text-base font-semibold text-foreground">Scope of Work</h3>
          <p className="text-xs text-muted-foreground mt-0.5">Define deliverables, key milestones, and scope specifications.</p>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase text-muted-foreground flex items-center gap-1.5">
            <FileText className="h-3.5 w-3.5" />
            Project Description <span className="text-red-600">*</span>
          </label>
          <textarea
            rows={5}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe the scope, key milestones, inclusions, and deliverables..."
            className="w-full rounded-xl border border-border px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/20 transition-all shadow-xs resize-none"
          />
          <p className="text-xs text-muted-foreground">
            Be specific about deliverables, milestones, and any project exclusions.
          </p>
          {state.errors?.description && (
            <p className="text-xs text-red-600">{state.errors.description[0]}</p>
          )}
        </div>
      </div>

      {/* Section 3: Materials and Hours */}
      <div className="rounded-2xl border border-border bg-card p-6 shadow-xs space-y-5">
        <div className="border-b border-border pb-4 flex flex-wrap items-center justify-between gap-2">
          <div>
            <h3 className="text-base font-semibold text-foreground">Materials used and hours worked</h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Select materials and quantities, then estimate total execution hours.
            </p>
          </div>
          <Button type="button" variant="outline" className="rounded-xl" onClick={addMaterialRow}>
            <Plus className="size-4" />
          </Button>
        </div>

        <div className="space-y-3">
          {materialsUsed.map((row, index) => (
            <div key={`material-row-${index}`} className="grid grid-cols-1 md:grid-cols-[minmax(0,2fr)_140px_auto] gap-3">
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase text-muted-foreground flex items-center gap-1.5">
                  <Wrench className="h-3.5 w-3.5" />
                  Material
                </label>
                <Select
                  value={row.material_cost_id}
                  onValueChange={(value) => updateMaterialRow(index, { material_cost_id: value ?? "" })}
                >
                  <SelectTrigger className="h-11 w-full rounded-xl border-border bg-white pl-3.5 text-sm shadow-xs transition-all hover:bg-muted/50 focus:border-ring focus:ring-2 focus:ring-ring/20">
                    {row.material_cost_id ? (
                      <span className="truncate">
                        {materialById.get(row.material_cost_id)?.name ?? "Select registered material..."}
                      </span>
                    ) : (
                      <SelectValue placeholder="Select registered material..." />
                    )}
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-border shadow-lg" alignItemWithTrigger={false}>
                    {materials.length === 0 ? (
                      <div className="px-3 py-2 text-xs text-muted-foreground">No materials registered yet.</div>
                    ) : (
                      materials.map((material) => (
                        <SelectItem key={material.id} value={material.id} className="cursor-pointer">
                          <div className="flex flex-col">
                            <span className="font-medium">{material.name}</span>
                            <span className="text-xs text-muted-foreground">{material.unit} • ${material.value}</span>
                          </div>
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>
                
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase text-muted-foreground relative bottom-1.5 max-sm:block  max-sm:bottom-0">Quantity</label>
                <Input
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={row.quantity}
                  onChange={(event) => updateMaterialRow(index, { quantity: event.target.value })}
                  className="w-full max-w-32 rounded-xl border-border bg-white text-sm shadow-xs"
                />
              </div>

              <div className="flex flex-col text-xs self-center">
                <span className="text-xs font-semibold uppercase  flex items-center text-white relative bottom-1.5">
                  Remove</span>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => removeMaterialRow(index)}
                  className="rounded-xl bg-action/30 border-action hover:bg-action/40"
                >
                  <Trash2 className="size-4 text-action" />
                </Button>
              </div>
            </div>
          ))}

          {state.errors?.materials_payload && (
            <p className="text-xs text-red-600">{state.errors.materials_payload[0]}</p>
          )}

          <div className="pt-1">
            <Link href="/dashboard/costs/materials">
              <Button type="button" variant="outline" className="rounded-xl">
                Material Registration
              </Button>
            </Link>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase text-muted-foreground flex items-center gap-1.5">
            <Clock3 className="h-3.5 w-3.5" />
            Estimated hours worked
          </label>
          <Input
            type="number"
            min="0"
            step="0.01"
            value={estimatedHours}
            onChange={(event) => setEstimatedHours(event.target.value)}
            className="w-full max-w-48 rounded-xl border-border bg-white text-sm shadow-xs"
          />
          {state.errors?.estimated_hours && (
            <p className="text-xs text-red-600">{state.errors.estimated_hours[0]}</p>
          )}
        </div>
      </div>

      {/* Section 4: Commercial Terms & Tracking */}
      <div className="rounded-2xl border border-border bg-card p-6 shadow-xs space-y-5">
        <div className="border-b border-border pb-4">
          <h3 className="text-base font-semibold text-foreground">Commercial Terms</h3>
          <p className="text-xs text-muted-foreground mt-0.5">Specify pricing metrics, deadlines, and operational statuses.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase text-muted-foreground flex items-center gap-1.5">
              <DollarSign className="h-3.5 w-3.5" />
              Total Price (USD) <span className="text-red-600">*</span>
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-sm font-semibold text-muted-foreground">
                $
              </span>
              <Input
                type="number"
                step="0.01"
                min="0"
                value={computedTotalPrice}
                placeholder="0.00"
                readOnly
                className="rounded-xl border-border bg-white pl-8 text-sm font-semibold tabular-nums shadow-xs transition-all focus:border-ring focus:ring-2 focus:ring-ring/20"
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Materials: ${materialsSubtotal.toFixed(2)} | Hours: ${laborSubtotal.toFixed(2)} | Profit: {profitPercent}%
            </p>
            {state.errors?.price && (
              <p className="text-xs text-red-600">{state.errors.price[0]}</p>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase text-muted-foreground flex items-center gap-1.5">
              <CalendarIcon className="h-3.5 w-3.5" />
              Target Due Date <span className="text-red-600">*</span>
            </label>
            <Popover>
              <PopoverTrigger render={
                <Button
                  variant={"outline"}
                  className={cn(
                    "w-full justify-start text-left font-normal rounded-xl border-border bg-white text-sm shadow-xs transition-all focus:border-ring focus:ring-2 focus:ring-ring/20",
                    !dueDate && "text-muted-foreground"
                  )}>
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dueDate ? format(dueDate, "PPP") : <span>Pick a date</span>}
                </Button>
              }>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start" >
                <Calendar
                  mode="single"
                  selected={dueDate}
                  onSelect={setDueDate}
                />
              </PopoverContent>
            </Popover>
            {state.errors?.due_date && (
              <p className="text-xs text-red-600">{state.errors.due_date[0]}</p>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase text-muted-foreground flex items-center gap-1.5">
              <Tag className="h-3.5 w-3.5" />
              Initial Status
            </label>
            <Select value={status} onValueChange={(value) => setStatus(value as string)}>
              <SelectTrigger className="h-12 w-full rounded-xl border-border bg-white pl-3.5 text-sm shadow-xs transition-all hover:bg-muted/50 focus:border-ring focus:ring-2 focus:ring-ring/20">
                <SelectValue placeholder="Select status..." />
              </SelectTrigger>
              <SelectContent className="rounded-xl border-border shadow-lg" alignItemWithTrigger={false}>
                <SelectItem value="quote_sent" className="cursor-pointer">Quote Sent</SelectItem>
                <SelectItem value="approved" className="cursor-pointer">Approved</SelectItem>
                <SelectItem value="in_progress" className="cursor-pointer">In Progress</SelectItem>
                <SelectItem value="delivered" className="cursor-pointer">Delivered</SelectItem>
              </SelectContent>
            </Select>
            {state.errors?.status && (
              <p className="text-xs text-red-600">{state.errors.status[0]}</p>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase text-muted-foreground flex items-center gap-1.5">
              <CreditCard className="h-3.5 w-3.5" />
              Payment Status
            </label>
            <Select value={paymentStatus} onValueChange={(paymentStatus) => setPaymentStatus(paymentStatus as string)}>
              <SelectTrigger className="h-12 w-full rounded-xl border-border bg-white pl-3.5 text-sm shadow-xs transition-all hover:bg-muted/50 focus:border-ring focus:ring-2 focus:ring-ring/20">
                <SelectValue placeholder={"Select payment status..."} />
              </SelectTrigger>
              <SelectContent className="rounded-xl border-border shadow-lg" alignItemWithTrigger={false}>
                <SelectItem value="pending" className="cursor-pointer">Pending</SelectItem>
                <SelectItem value="paid" className="cursor-pointer">Paid</SelectItem>
                <SelectItem value="overdue" className="cursor-pointer">Overdue</SelectItem>
              </SelectContent>
            </Select>
            {state.errors?.payment_status && (
              <p className="text-xs text-red-600">{state.errors.payment_status[0]}</p>
            )}
          </div>
        </div>
      </div>

      {(missingLaborCost || missingTargetProfit) && (
        <div className="flex flex-col gap-2 rounded-xl border border-red-600/20 bg-red-50 px-4 py-3 text-sm text-red-600">
          <div className="flex items-start gap-2">
            <AlertCircle className="h-4 w-4 mt-0.5" />
            <p>
              Configure labor cost and target profit before creating a new order with automatic pricing.
            </p>
          </div>
          <div className="flex flex-wrap gap-2 pl-6">
            {missingLaborCost && (
              <Link href="/dashboard/costs/labor">
                <Button type="button" variant="outline" className="rounded-xl">
                  Go to Labor Costs
                </Button>
              </Link>
            )}
            {missingTargetProfit && (
              <Link href="/dashboard/costs/target-profit">
                <Button type="button" variant="outline" className="rounded-xl">
                  Go to Target Profit
                </Button>
              </Link>
            )}
          </div>
        </div>
      )}

      {/* Form Action Buttons */}
      <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
        <Button
          type="submit"
          disabled={isPending || !canSubmit}
          className="h-11 px-6 rounded-xl bg-action text-white hover:bg-action/90 font-semibold shadow-xs transition-all cursor-pointer"
        >
          {isPending ? (
            <>
              <Loader className="w-4 h-4 mr-2 animate-spin" />
              Creating Order...
            </>
          ) : (
            "Save & Generate Quote"
          )}
        </Button>
      </div>
    </form>
  );
}