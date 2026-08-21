'use server'

import { createClient } from "../supabase/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { redis } from "@/lib/redis/redis"

const CustomerFormSchema = z.object({
    name: z
        .string()
        .trim()
        .min(1, "Customer's name is required.")
        .max(100, "Name must be less than 100 characters."),
    email: z
        .string()
        .trim()
        .email("Please enter a valid email address.")
        .max(50, "Email must be less than 50 characters."),
    country: z
        .string()
        .trim()
        .min(1, "Country is required")
        .max(100, "Country must be less than 100 characters"),
    phone: z
        .string()
        .trim()
        .min(1, "Customer's phone number is required.")
        .max(
            20,
            "Phone number must be less than 20 characters."
        ),
});

export type State = {
    errors?: {
        name?: string[];
        email?: string[];
        country?: string[]
        phone?: string[]
    };
    message?: string | null;
    success?: boolean;
}

/**
 * Converts FormData into a validated object.
 */
function getCustomerData(
    formData: FormData
) {
    return {
        name:
            String(
                formData.get("name") ?? ""
            ),
        email:
            String(
                formData.get("email") ?? ""
            ),
        country:
            String(
                formData.get("country") ?? ""
            ),
        phone:
            String(
                formData.get("phone") ?? ""
            ),
    };
}


export async function createCustomer(prevState: State, formData: FormData): Promise<State> {

    const supabase = await createClient();
    const parsed = CustomerFormSchema.safeParse(getCustomerData(formData));
    // if (!parsed.success) {
    //     throw new Error('Invalid project input.' + parsed.error.toString());
    // }
    if (!parsed.success) {
        return {
            errors: parsed.error.flatten().fieldErrors,
            message: 'Missing or invalid fields. Failed to create project.',
        };
    }

    const { name, email, country, phone } = parsed.data;

    try {
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return { message: 'Unauthorized: You must be logged in.' };
        }
        const { data, error } = await supabase
            .from('customers')
            .insert({
                user_id: user.id,
                name,
                email,
                country,
                phone,
            });

        if (error) {
            console.error("Supabase insert error:", error);
            return { message: 'Database error: Failed to create customer.' };
        }
        if (!redis.isOpen) await redis.connect();
        await redis.del(`customers:${user.id}`);
        revalidatePath('/dashboard/customers');
        return { success: true, message: 'Customer created successfully!' };
    } catch (error) {
        console.error("Unexpected error:", error);
        return {
            message: 'Database Error: Failed to create project.'
        }
    }
}

export async function updateCustomer(id: string | number, prevState: State, formData: FormData): Promise<State> {

    const supabase = await createClient();
    const parsed = CustomerFormSchema.safeParse(getCustomerData(formData));

    if (!parsed.success) {
        return {
            errors: parsed.error.flatten().fieldErrors,
            message: 'Missing or invalid fields. Failed to update project',
        };
    }

    const { name, email, country, phone } = parsed.data;

    try {
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return { message: 'Unauthorized: You must be logged in.' };
        }
        const { data, error } = await supabase
            .from('customers')
            .update({
                name,
                email,
                country,
                phone,
            }).eq('id', id).eq('user_id', user.id);

        if (error) {
            console.error("Supabase insert error:", error);
            return { message: 'Database error: Failed to update customer.' };
        }

        if (!redis.isOpen) await redis.connect();
        await redis.del(`customers:${user.id}`);

        revalidatePath('/dashboard/customers');
        return { success: true, message: 'Customer updated successfully!' };
    } catch (error) {
        console.error("Unexpected error:", error);
        return {
            message: 'Database Error: Failed to Update customer.'
        }
    }
}


export async function deleteCustomer(id: string | number) {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
        throw new Error("Unauthorized: User not logged in.");
    }

    try {
        const { error } = await supabase
            .from('customers')
            .delete()
            .eq('id', id)
            .eq('user_id', user.id)

        if (error) {
            console.error("Supabase delete customer error:", error);
            return { message: 'Database error: Failed to delete customer.' };
        }

        if (!redis.isOpen) await redis.connect();
        await redis.del(`customers:${user.id}`);

        revalidatePath('/dashboard/customers');
        return { success: true, message: 'Customer deleted successfully!' };
    } catch (error) {
        console.error("Unexpected error:", error);
        return {
            message: 'Database Error: Failed to delete customer.'
        }
    }
}


export async function selectAllCustomers() {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
        throw new Error("Unauthorized: User not logged in.");
    }

    const cacheKey = `customers:${user.id}`;

    try {
        if (!redis.isOpen) await redis.connect();
        const cachedData = await redis.get(cacheKey);

        if (cachedData) {
            console.log("🟢 [CACHE HIT]: Reading from Redis, skipping Supabase!");
            return JSON.parse(cachedData);
        }

        console.log("🔴 [CACHE MISS]: Hitting Supabase database...");
        const { data, error } = await supabase
            .from('customers')
            .select('*')
            .eq("user_id", user.id)
            .order('created_at', { ascending: true });

        if (error) throw error;

        await redis.set(cacheKey, JSON.stringify(data), { EX: 300 });

        return data;
    } catch (error) {
        console.error("Unexpected error:", error);
        return null;
    }
}

export async function selectOneCustomer(id: string) {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
        throw new Error("Unauthorized: User not logged in.");
    }

    const cacheKey = `customer:${user.id}:${id}`;

    try {
        if (!redis.isOpen) await redis.connect();
        const cachedData = await redis.get(cacheKey);

        if (cachedData) {
            console.log(`🟢 [CACHE HIT]: Single customer ${id}`);
            return JSON.parse(cachedData);
        }

        console.log(`🔴 [CACHE MISS]: Fetching single customer ${id} from Supabase`);
        const { data, error } = await supabase
            .from('customers')
            .select('*')
            .eq('id', id)
            .eq('user_id', user.id)
            .single();

        if (error) throw error;

        await redis.set(cacheKey, JSON.stringify(data), { EX: 300 });

        return data;
    } catch (error) {
        console.error("Unexpected error:", error);
        return null;
    }
}
