"use client";

import { useActionState, useEffect } from "react";
import { Save, PencilLine } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { upsertTargetProfit, type CostValueState } from "@/lib/costs/action";
import type { TargetProfit } from "@/lib/types/dashBoardTypes";

const initialState: CostValueState = {};

export default function TargetProfitForm({ targetProfit }: { targetProfit: TargetProfit | null }) {
  const [state, formAction] = useActionState(upsertTargetProfit, initialState);

  useEffect(() => {
    if (state?.success) {
      toast.success(state.message || "Target profit saved successfully!");
    } else if (state?.message && !state?.success) {
      toast.error(state.message);
    }
  }, [state]);

  return (
    <Card className="p-6 w-full max-w-3xl">
      <CardHeader>
        <CardTitle className="font-heading text-2xl font-bold">Target Profit</CardTitle>
        <CardDescription>Set your desired profit margin percentage for recommendations.</CardDescription>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <Label htmlFor="profit_percent" className="font-medium">Desired Profit Percentage (%)</Label>
            <Input
              id="profit_percent"
              name="profit_percent"
              type="number"
              step="0.01"
              min="0"
              max="100"
              placeholder="0"
              defaultValue={targetProfit?.profit_percent ?? ""}
              required
              className="rounded-xl"
            />
            {state.errors?.profit_percent && (
              <p className="text-xs text-red-600">{state.errors.profit_percent[0]}</p>
            )}
          </div>

          <div className="flex justify-end gap-3">
            <Button
              type="submit"
              name="mode"
              value="save"
              className="bg-action hover:bg-action rounded-xl h-10 px-4 text-white"
            >
              <Save className="size-4" />
              Save
            </Button>
            <Button
              type="submit"
              name="mode"
              value="update"
              variant="outline"
              className="rounded-xl h-10 px-4"
            >
              <PencilLine className="size-4" />
              Update
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
