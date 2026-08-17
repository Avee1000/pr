"use client";

import { useActionState, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Pencil, Plus, Save, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SubmitButton } from "@/components/global/SubmitButton";
import { createMaterialsBatch, type MaterialState, updateMaterial, deleteMaterial } from "@/lib/costs/action";
import type { Material } from "@/lib/types/dashBoardTypes";
import Delete from "./DeleteMaterial";
import { useCurrency } from "@/components/context/currencyContext";
import Information from "@/components/global/Information";

type MaterialDraft = {
  name: string;
  unit: string;
  value: string | number;
};

const initialDraft: MaterialDraft = {
  name: "",
  unit: "",
  value: "",
};

const initialState: MaterialState = {};

function MaterialEditRow({ material }: { material: Material }) {
  const [state, formAction] = useActionState(updateMaterial.bind(null, material.id), initialState);
  const { currencySymbol, rates, currency, loading } = useCurrency();

  // 1. Calculate the raw numeric value in the active currency (no symbols/commas)
  const rate = rates[currency] || 1;
  const convertedNumericValue = (Number(material.value) * rate).toFixed(2);

  useEffect(() => {
    if (state?.success) {
      toast.success(state.message || "Material updated successfully!");
    } else if (state?.message && !state?.success) {
      toast.error(state.message);
    }
  }, [state]);

  return (
    <form action={formAction} className="grid grid-cols-1 md:grid-cols-[2fr_1fr_1fr_auto] gap-3 rounded-xl border border-border p-3 items-end">
      <div className="flex flex-col gap-2">
        <Label htmlFor={`name-${material.id}`}>Name</Label>
        <Input id={`name-${material.id}`} name="name" defaultValue={material.name} required className="rounded-xl" />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor={`unit-${material.id}`}>Unit</Label>
        <Input id={`unit-${material.id}`} name="unit" defaultValue={material.unit} required className="rounded-xl" />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor={`value-${material.id}`}>Value ({currencySymbol})</Label>
        {/* 2. Visual Currency Symbol Prefix */}
        <div className="relative flex items-center">
          {/* <span className="absolute left-4 text-muted-foreground text-sm font-medium select-none">
            {currencySymbol}
          </span> */}
          <Input
            id={`value-${material.id}`}
            name="value"
            type="number"
            step="0.01"
            min="0.01"
            defaultValue={loading ? material.value : convertedNumericValue}
            required
            className="rounded-xl"
          />
        </div>
      </div>

      <div className="flex items-end gap-2">
        <SubmitButton
          label="Update"
          Icon={Pencil}
          className="bg-action hover:bg-action rounded-xl h-10 px-4 text-white w-full md:w-auto"
        />
        <Delete id={material.id} />
      </div>

      {(state.errors?.name || state.errors?.unit || state.errors?.value) && (
        <p className="text-xs text-red-600 md:col-span-4">
          {state.errors?.name?.[0] || state.errors?.unit?.[0] || state.errors?.value?.[0]}
        </p>
      )}
    </form>
  );
}

export default function MaterialCostsForm({ materials }: { materials: Material[] }) {
  const [items, setItems] = useState<MaterialDraft[]>([initialDraft]);
  const { currencySymbol, rates, currency, loading } = useCurrency();
  const rate = rates[currency] || 1;
  const [state, formAction] = useActionState(
    async (prevState: MaterialState, formData: FormData) => {
      const result = await createMaterialsBatch(prevState, formData);
      if (result.success) {
        setItems([{ ...initialDraft }]);
      }
      return result;
    },
    initialState
  );

  const payload = useMemo(
    () =>
      JSON.stringify(
        items
          .map((item) => {
            const rawLocalValue = Number(item.value) || 0;
            const usdValue = rate > 0 ? Number((rawLocalValue / rate).toFixed(2)) : rawLocalValue;

            return {
              name: item.name.trim(),
              unit: item.unit.trim(),
              value: usdValue, 
            };
          })
          .filter((item) => item.name || item.unit || item.value)
      ),
    [items, rate]
  );

  useEffect(() => {
    if (state?.success) {
      toast.success(state.message || "Materials saved successfully!");
    } else if (state?.message && !state?.success) {
      toast.error(state.message);
    }
  }, [state]);

  const addItem = () => {
    setItems((prev) => [...prev, { ...initialDraft }]);
  };

  const removeItem = (index: number) => {
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const updateItem = (index: number, field: keyof MaterialDraft, value: string) => {
    setItems((prev) => prev.map((item, i) => (i === index ? { ...item, [field]: value } : item)));
  };

  return (
    <div className="flex flex-col gap-8">
      <Card className="p-6 w-full">
        <CardHeader>
          <CardTitle className="font-heading text-2xl font-bold">Material Costs <Information detail="Input the the material value in your preferred local currency" /></CardTitle>
          <CardDescription>Add your materials with name, unit, and cost value.</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={formAction} className="flex flex-col gap-6">
            <input type="hidden" name="items_payload" value={payload} />

            <div className="flex flex-col gap-4">
              {items.map((item, index) => (
                <div key={`material-draft-${index}`} className="flex items-end gap-3 rounded-xl border border-border p-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 flex-1">
                    <div className="flex flex-col gap-2">
                      <Label htmlFor={`draft-name-${index}`}>Name</Label>
                      <Input
                        id={`draft-name-${index}`}
                        placeholder="Material name"
                        value={item.name}
                        onChange={(event) => updateItem(index, "name", event.target.value)}
                        className="rounded-xl"
                        required
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <Label htmlFor={`draft-unit-${index}`}>Unit</Label>
                      <Input
                        id={`draft-unit-${index}`}
                        placeholder="kg, meter, unit..."
                        value={item.unit}
                        onChange={(event) => updateItem(index, "unit", event.target.value)}
                        className="rounded-xl"
                        required
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <Label htmlFor={`draft-value-${index}`}>Value ({currencySymbol})</Label>
                      <Input
                        id={`draft-value-${index}`}
                        placeholder="0.00"
                        type="number"
                        step="0.01"
                        min="0.01"
                        value={item.value}
                        onChange={(event) => updateItem(index, "value", event.target.value)}
                        className="rounded-xl"
                        required
                      />
                    </div>
                  </div>

                  {/* Delete button for local row */}
                  {items.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeItem(index)}
                      className="text-red-500 hover:text-red-700 hover:bg-red-50 rounded-xl h-10 w-10 shrink-0"
                      title="Remove row"
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>

            {state.errors?.items_payload && (
              <p className="text-xs text-red-600">{state.errors.items_payload[0]}</p>
            )}

            {/* Improved button layout: aligned, distinct styles, full-width support on smaller screens */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={addItem}
                className="rounded-xl w-full sm:w-auto h-10 px-4"
              >
                <Plus className="size-4 mr-2" />
                Add more item
              </Button>
              <SubmitButton
                label="Save All Materials"
                Icon={Save}
                className="bg-action hover:bg-action/90 rounded-xl h-10 px-6 text-white w-full sm:w-auto"
              />
            </div>
          </form>
        </CardContent>
      </Card>

      <Card className="p-6 w-full">
        <CardHeader>
          <CardTitle className="font-heading text-xl font-semibold">Update Registered Materials</CardTitle>
          <CardDescription>Use the Update button to modify any existing material item.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          {materials.length === 0 ? (
            <p className="text-sm text-muted-foreground">No materials registered yet.</p>
          ) : (
            materials.map((material) => <MaterialEditRow key={material.id} material={material} />)
          )}
        </CardContent>
      </Card>
    </div>
  );
}