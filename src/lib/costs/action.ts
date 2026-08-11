'use server'

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "../supabase/server";
import type { LaborCost, Material, TargetProfit } from "../supabase/types";
import { getCache, setCache, delPattern, CacheKeys, TTL_SECONDS } from "../redis/cache";

function formatDbErrorMessage(error: { message: string }, fallback: string) {
  if (error.message.includes("Could not find the table 'public.material_costs'")) {
    const projectRef = process.env.NEXT_PUBLIC_SUPABASE_URL?.match(/https:\/\/([^.]+)\./)?.[1] ?? "unknown-project";
    return `Database error: material_costs table not found in project ${projectRef}. Run sql/2026-07-31-costs-registration.sql in this same Supabase project and execute: notify pgrst, 'reload schema';`;
  }
  return `${fallback} ${error.message}`;
}

const MaterialSchema = z.object({
  name: z.string().trim().min(1, "Material name is required.").max(100, "Name must be less than 100 characters."),
  unit: z.string().trim().min(1, "Unit is required.").max(30, "Unit must be less than 30 characters."),
  value: z.coerce.number().positive("Value must be greater than zero."),
});

const MaterialsBatchSchema = z
  .array(MaterialSchema)
  .min(1, "Add at least one material item before saving.");

const LaborCostSchema = z.object({
  hourly_rate: z.coerce.number().positive("Hourly rate must be greater than zero."),
});

const TargetProfitSchema = z.object({
  profit_percent: z.coerce
    .number()
    .min(0, "Profit percent must be at least 0%.")
    .max(100, "Profit percent cannot be greater than 100%"),
});

export type MaterialState = {
  errors?: {
    name?: string[];
    unit?: string[];
    value?: string[];
    items_payload?: string[];
  };
  message?: string | null;
  success?: boolean;
};

export type CostValueState = {
  errors?: {
    hourly_rate?: string[];
    profit_percent?: string[];
  };
  message?: string | null;
  success?: boolean;
};

function getMaterialData(formData: FormData) {
  return {
    name: String(formData.get("name") ?? ""),
    unit: String(formData.get("unit") ?? ""),
    value: formData.get("value"),
  };
}

export async function createMaterialsBatch(
  prevState: MaterialState,
  formData: FormData
): Promise<MaterialState> {
  const supabase = await createClient();
  const payload = String(formData.get("items_payload") ?? "[]");

  let parsedJson: unknown;
  try {
    parsedJson = JSON.parse(payload);
  } catch {
    return {
      errors: { items_payload: ["Invalid material payload."] },
      message: "Missing or invalid fields. Failed to save materials.",
    };
  }

  const parsedMaterials = MaterialsBatchSchema.safeParse(parsedJson);
  if (!parsedMaterials.success) {
    return {
      errors: { items_payload: parsedMaterials.error.issues.map((issue) => issue.message) },
      message: "Missing or invalid fields. Failed to save materials.",
    };
  }

  try {
    const records = parsedMaterials.data.map((material) => ({
      name: material.name,
      unit: material.unit,
      value: material.value,
    }));

    const { error } = await supabase.from("material_costs").insert(records);

    if (error) {
      console.error("Supabase insert materials error:", error);
      return {
        message: formatDbErrorMessage(error, "Database error: Failed to save materials."),
      };
    }

    revalidatePath("/dashboard/costs/materials");
    delPattern(`materials:*`).catch(() => {});
    return { success: true, message: "Materials saved successfully!" };
  } catch (error) {
    console.error("Unexpected create materials error:", error);
    return { message: "Database Error: Failed to save materials." };
  }
}

export async function updateMaterial(
  id: string,
  prevState: MaterialState,
  formData: FormData
): Promise<MaterialState> {
  const supabase = await createClient();
  const parsed = MaterialSchema.safeParse(getMaterialData(formData));

  if (!parsed.success) {
    return {
      errors: parsed.error.flatten().fieldErrors,
      message: "Missing or invalid fields. Failed to update material.",
    };
  }

  try {
    const { name, unit, value } = parsed.data;

    const { error } = await supabase
      .from("material_costs")
      .update({ name, unit, value })
      .eq("id", id);

    if (error) {
      console.error("Supabase update material error:", error);
      return {
        message: formatDbErrorMessage(error, "Database error: Failed to update material."),
      };
    }

    revalidatePath("/dashboard/costs/materials");
    delPattern(`materials:*`).catch(() => {});
    return { success: true, message: "Material updated successfully!" };
  } catch (error) {
    console.error("Unexpected update material error:", error);
    return { message: "Database Error: Failed to update material." };
  }
}

export async function selectAllMaterials(): Promise<Material[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("material_costs")
    .select("*")
    .order("created_at", { ascending: true });

  if (error) {
    console.error("Supabase select materials error:", error);
    return [];
  }

  const materials = (data ?? []) as Material[];
  await setCache(CacheKeys.materials("global"), materials, TTL_SECONDS.MEDIUM);
  return materials;
}

export async function upsertLaborCost(
  prevState: CostValueState,
  formData: FormData
): Promise<CostValueState> {
  const supabase = await createClient();
  const mode = String(formData.get("mode") ?? "save");
  const parsed = LaborCostSchema.safeParse({
    hourly_rate: formData.get("hourly_rate"),
  });

  if (!parsed.success) {
    return {
      errors: parsed.error.flatten().fieldErrors,
      message: "Missing or invalid fields. Failed to save labor cost.",
    };
  }

  try {
    const { data: existingRows, error: existingError } = await supabase
      .from("labor_costs")
      .select("id")
      .order("created_at", { ascending: false })
      .limit(1);

    if (existingError) {
      console.error("Supabase select labor_costs error:", existingError);
      return { message: "Database error: Failed to check labor cost." };
    }

    const existing = existingRows?.[0] ?? null;

    const hourly_rate = parsed.data.hourly_rate;

    if (existing?.id) {
      const { error } = await supabase
        .from("labor_costs")
        .update({ hourly_rate })
        .eq("id", existing.id);

      if (error) {
        console.error("Supabase update labor_costs error:", error);
        return { message: "Database error: Failed to update labor cost." };
      }
    } else {
      const { error } = await supabase.from("labor_costs").insert({
        hourly_rate,
      });

      if (error) {
        console.error("Supabase insert labor_costs error:", error);
        return { message: "Database error: Failed to save labor cost." };
      }
    }

    revalidatePath("/dashboard/costs/labor");
    delPattern(`laborCost:*`).catch(() => {});
    return {
      success: true,
      message: mode === "update" ? "Labor cost updated successfully!" : "Labor cost saved successfully!",
    };
  } catch (error) {
    console.error("Unexpected upsert labor_costs error:", error);
    return { message: "Database Error: Failed to save labor cost." };
  }
}

export async function selectLaborCost(): Promise<LaborCost | null> {
  const supabase = await createClient();

  const cached = await getCache<LaborCost>(CacheKeys.laborCost("global"));
  if (cached !== null) return cached;

  const { data, error } = await supabase
    .from("labor_costs")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(1);

  if (error) {
    console.error("Supabase select labor_costs error:", error);
    return null;
  }

  const result = (data?.[0] as LaborCost | undefined) ?? null;
  await setCache(CacheKeys.laborCost("global"), result, TTL_SECONDS.MEDIUM);
  return result;
}

export async function upsertTargetProfit(
  prevState: CostValueState,
  formData: FormData
): Promise<CostValueState> {
  const supabase = await createClient();
  const mode = String(formData.get("mode") ?? "save");
  const parsed = TargetProfitSchema.safeParse({
    profit_percent: formData.get("profit_percent"),
  });

  if (!parsed.success) {
    return {
      errors: parsed.error.flatten().fieldErrors,
      message: "Missing or invalid fields. Failed to save target profit.",
    };
  }

  try {
    const { data: existingRows, error: existingError } = await supabase
      .from("target_profits")
      .select("id")
      .order("created_at", { ascending: false })
      .limit(1);

    if (existingError) {
      console.error("Supabase select target_profits error:", existingError);
      return { message: "Database error: Failed to check target profit." };
    }

    const existing = existingRows?.[0] ?? null;

    const profit_percent = parsed.data.profit_percent;

    if (existing?.id) {
      const { error } = await supabase
        .from("target_profits")
        .update({ profit_percent })
        .eq("id", existing.id);

      if (error) {
        console.error("Supabase update target_profits error:", error);
        return { message: "Database error: Failed to update target profit." };
      }
    } else {
      const { error } = await supabase.from("target_profits").insert({
        profit_percent,
      });

      if (error) {
        console.error("Supabase insert target_profits error:", error);
        return { message: "Database error: Failed to save target profit." };
      }
    }

    revalidatePath("/dashboard/costs/target-profit");
    delPattern(`targetProfit:*`).catch(() => {});
    return {
      success: true,
      message: mode === "update" ? "Target profit updated successfully!" : "Target profit saved successfully!",
    };
  } catch (error) {
    console.error("Unexpected upsert target_profits error:", error);
    return { message: "Database Error: Failed to save target profit." };
  }
}

export async function selectTargetProfit(): Promise<TargetProfit | null> {
  const supabase = await createClient();

  const cached = await getCache<TargetProfit>(CacheKeys.targetProfit("global"));
  if (cached !== null) return cached;

  const { data, error } = await supabase
    .from("target_profits")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(1);

  if (error) {
    console.error("Supabase select target_profits error:", error);
    return null;
  }

  const result = (data?.[0] as TargetProfit | undefined) ?? null;
  await setCache(CacheKeys.targetProfit("global"), result, TTL_SECONDS.MEDIUM);
  return result;
}

export async function deleteMaterial(
  id: string | number,
) {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    throw new Error("Unauthorized: User not logged in.");
  }

  try {
    const { data, error } = await supabase
      .from('material_costs')
      .delete()
      .eq('id', id)
      .select();

    if (error) {
      console.error("Supabase delete material error:", error);
      return {
        message: formatDbErrorMessage(error, "Database error: Failed to delete material."),
      };
    }
    if (!data || data.length === 0) {
      return { success: false, message: 'Material not found or you do not have permission to delete it.' };
    }
    revalidatePath("/dashboard/costs/materials");
    return { success: true, message: "Material delete successfully!" };
  } catch (error) {
    console.error("Unexpected delete material error:", error);
    return { message: "Database Error: Failed to delete material." };
  }
}