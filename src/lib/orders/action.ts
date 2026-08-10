'use server'

import { createClient } from "../supabase/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const MaterialUsageSchema = z.object({
    material_cost_id: z.string().uuid("Invalid material selected."),
    quantity: z.coerce.number().positive("Quantity must be greater than zero."),
});

const OrderFormSchema = z.object({
    customer_id: z.string().min(1, "Customer is required."),
    description: z.string().trim().min(1, "Project description is required."),
    price: z.coerce.number().positive("Price must be greater than zero."),
    estimated_hours: z.coerce.number().min(0, "Estimated hours must be 0 or greater."),
    due_date: z.string().min(1, "Target due date is required."),
    status: z.enum(["quote_sent", "approved", "in_progress", "delivered"], "Status is required."),
    payment_status: z.enum(["pending", "paid", "overdue"], "Payment status is required."),
});

export type OrderState = {
    errors?: {
        customer_id?: string[];
        description?: string[];
        price?: string[];
        estimated_hours?: string[];
        due_date?: string[];
        status?: string[];
        payment_status?: string[];
        materials_payload?: string[];
    };
    message?: string | null;
    success?: boolean;
}

function getOrderData(formData: FormData) {
    return {
        customer_id: String(formData.get("customer_id") ?? ""),
        description: String(formData.get("description") ?? ""),
        price: formData.get("price"),
        estimated_hours: formData.get("estimated_hours"),
        due_date: String(formData.get("due_date") ?? ""),
        status: String(formData.get("status") ?? "quote_sent"),
        payment_status: String(formData.get("payment_status") ?? "pending"),
    };
}

function parseMaterialsPayload(rawPayload: string) {
    const parsedJson = JSON.parse(rawPayload) as unknown;
    return z.array(MaterialUsageSchema).min(1, "Add at least one material item.").safeParse(parsedJson);
}

function roundCurrency(value: number) {
    return Number(value.toFixed(2));
}

export async function createOrder(prevState: OrderState, formData: FormData): Promise<OrderState> {
    const supabase = await createClient();
    const parsed = OrderFormSchema.safeParse(getOrderData(formData));
    const rawMaterialsPayload = String(formData.get("materials_payload") ?? "[]");

    if (!parsed.success) {
        return {
            errors: parsed.error.flatten().fieldErrors,
            message: 'Missing or invalid fields. Failed to create order.',
        };
    }

    let materialPayloadParsed: ReturnType<typeof parseMaterialsPayload>;
    try {
        materialPayloadParsed = parseMaterialsPayload(rawMaterialsPayload);
    } catch {
        return {
            errors: { materials_payload: ["Invalid materials payload."] },
            message: 'Missing or invalid fields. Failed to create order.',
        };
    }

    if (!materialPayloadParsed.success) {
        return {
            errors: { materials_payload: materialPayloadParsed.error.issues.map((issue) => issue.message) },
            message: 'Missing or invalid fields. Failed to create order.',
        };
    }

    const selectedMaterials = materialPayloadParsed.data;

    const { customer_id, description, estimated_hours, due_date, status, payment_status } = parsed.data;

    try {
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return { message: 'Unauthorized: You must be logged in.' };
        }

        const materialIds = [...new Set(selectedMaterials.map((item) => item.material_cost_id))];
        const { data: materials, error: materialsError } = await supabase
            .from("material_costs")
            .select("id, name, unit, value")
            .in("id", materialIds);

        if (materialsError || !materials) {
            console.error("Supabase select material_costs error:", materialsError);
            return { message: 'Database error: Failed to load materials for pricing.' };
        }

        const materialMap = new Map(materials.map((material) => [material.id, material]));
        const invalidMaterial = selectedMaterials.find((item) => !materialMap.has(item.material_cost_id));
        if (invalidMaterial) {
            return {
                errors: { materials_payload: ["One or more selected materials were not found."] },
                message: 'Missing or invalid fields. Failed to create order.',
            };
        }

        const { data: laborRows, error: laborError } = await supabase
            .from("labor_costs")
            .select("hourly_rate")
            .order("created_at", { ascending: false })
            .limit(1);

        if (laborError) {
            console.error("Supabase select labor_costs error:", laborError);
            return { message: 'Database error: Failed to load labor costs.' };
        }

        if (!laborRows || laborRows.length === 0) {
            return { message: 'Labor cost is not configured. Go to Costs Registration > Labor Costs first.' };
        }

        const { data: profitRows, error: profitError } = await supabase
            .from("target_profits")
            .select("profit_percent")
            .order("created_at", { ascending: false })
            .limit(1);

        if (profitError) {
            console.error("Supabase select target_profits error:", profitError);
            return { message: 'Database error: Failed to load target profit.' };
        }

        if (!profitRows || profitRows.length === 0) {
            return { message: 'Target profit is not configured. Go to Costs Registration > Target Profit first.' };
        }

        const hourlyRate = Number(laborRows[0].hourly_rate ?? 0);
        const profitPercent = Number(profitRows[0].profit_percent ?? 0);

        const materialLineItems = selectedMaterials.map((item) => {
            const material = materialMap.get(item.material_cost_id)!;
            const unitValue = Number(material.value);
            const quantity = Number(item.quantity);
            const lineTotal = roundCurrency(unitValue * quantity);

            return {
                material_cost_id: material.id,
                material_name_snapshot: material.name,
                unit_snapshot: material.unit,
                unit_value_snapshot: unitValue,
                quantity,
                line_total: lineTotal,
            };
        });

        const materialsSubtotal = roundCurrency(
            materialLineItems.reduce((sum, item) => sum + item.line_total, 0)
        );
        const laborSubtotal = roundCurrency(estimated_hours * hourlyRate);
        const subtotal = roundCurrency(materialsSubtotal + laborSubtotal);
        const price = roundCurrency(subtotal * (1 + profitPercent / 100));

        const paidAt = payment_status === 'paid' ? new Date().toISOString() : null;

        const { data: createdOrder, error } = await supabase
            .from('orders')
            .insert({
                user_id: user.id,
                customer_id,
                description,
                price,
                estimated_hours,
                due_date,
                status,
                payment_status,
                paid_at: paidAt,
            })
            .select("id")
            .single();

        if (error) {
            console.error("Supabase insert error:", error);
            return { message: 'Database error: Failed to create order.' };
        }

        const orderMaterialItems = materialLineItems.map((item) => ({
            order_id: createdOrder.id,
            ...item,
        }));

        const { error: orderItemsError } = await supabase
            .from("order_material_items")
            .insert(orderMaterialItems);

        if (orderItemsError) {
            console.error("Supabase insert order_material_items error:", orderItemsError);
            await supabase.from("orders").delete().eq("id", createdOrder.id);
            return { message: 'Database error: Failed to save order materials.' };
        }

        revalidatePath('/dashboard');
        return { success: true, message: 'Order created successfully!' };
    } catch (error) {
        console.error("Unexpected error:", error);
        return { message: 'Database Error: Failed to create order.' };
    }
}

// export async function updateCustomer(id: string | number, prevState: State, formData: FormData): Promise<State> {

//     const supabase = await createClient();
//     const parsed = CustomerFormSchema.safeParse(getCustomerData(formData));

//     if (!parsed.success) {
//         return {
//             errors: parsed.error.flatten().fieldErrors,
//             message: 'Missing or invalid fields. Failed to update project.',
//         };
//     }

//     const { name, email, country, phone } = parsed.data;

//     try {
//         const { data: { user }, error: authError } = await supabase.auth.getUser();
//         if (authError || !user) {
//             return { message: 'Unauthorized: You must be logged in.' };
//         }
//         const { data, error } = await supabase
//             .from('customers')
//             .update({
//                 name,
//                 email,
//                 country,
//                 phone,
//             }).eq('id', id);
//         if (error) {
//             console.error("Supabase insert error:", error);
//             return { message: 'Database error: Failed to update customer.' };
//         }
//         revalidatePath('/dashboard/customers');
//         return { success: true, message: 'Customer updated successfully!' };
//     } catch (error) {
//         console.error("Unexpected error:", error);
//         return {
//             message: 'Database Error: Failed to Update customer.'
//         }
//     }
// }


// export async function deleteCustomer(id: string | number) {
//     const supabase = await createClient();
//     const { data: { user }, error: authError } = await supabase.auth.getUser();

//     if (authError || !user) {
//         throw new Error("Unauthorized: User not logged in.");
//     }

//     try {
//         const { error } = await supabase
//             .from('customers')
//             .delete()
//             .eq('id', id)
//         if (error) {
//             console.error("Supabase insert error:", error);
//             return { message: 'Database error: Failed to update customer.' };
//         }
//         revalidatePath('/dashboard/customers');
//         return { success: true, message: 'Customer deleted successfully!' };
//     }catch (error) {
//         console.error("Unexpected error:", error);
//         return {
//             message: 'Database Error: Failed to delete customer.'
//         }
//     }
// }



export async function selectAllOrders() {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
        throw new Error("Unauthorized: User not logged in.");
    }

    try {
        const { data, error } = await supabase
            .from('orders')
            .select(`
                *,
                customers ( id, name, email )
            `)
            .eq('user_id', user.id)
            .order('created_at', { ascending: true });
        if (error) throw error;

        if (!data) {
            return [];
        }

        const mappedData = data.map(order => {
            const { customers, ...allOrders } = order;
            return {
                allOrders,
                customer: customers
            };
        });
        return mappedData;
    } catch (error) {
        console.error("Unexpected error:", error);
        return null;
    }
}

// export async function selectOneCustomer(id: string) {
//     const supabase = await createClient();
//     const { data: { user }, error: authError } = await supabase.auth.getUser();

//     if (authError || !user) {
//         throw new Error("Unauthorized: User not logged in.");
//     }

//     try {
//         const { data, error } = await supabase
//             .from('customers')
//             .select('*').eq('id', id).eq('user_id', user.id).single();
//         if (error) throw error;
//         return data;
//         console.log(data);
//     } catch (error) {
//         console.error("Unexpected error:", error);
//         return null;
//     }
// }

export async function deleteOrder(id: string | number) {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
        throw new Error("Unauthorized: User not logged in.");
    }

    try {
        const { data, error } = await supabase
            .from('orders')
            .delete()
            .eq('id', id)
            .eq('user_id', user.id)
            .select();

        if (error) {
            console.error("Supabase delete error:", error);
            return { success: false, message: 'Database error: Failed to delete Order. Try again later.' };
        }

        if (!data || data.length === 0) {
            return { success: false, message: 'Order not found or you do not have permission to delete it.' };
        }

        revalidatePath('/dashboard/orders');
        return { success: true, message: 'Order deleted successfully!' };
    } catch (error) {
        console.error("Unexpected error:", error);
        return {
            success: false,
            message: 'Database Error: Failed to delete Order.'
        };
    }
}

export async function updateOrder(id: string | number, prevState: OrderState, formData: FormData) {
    const supabase = await createClient(); 
    const parsed = OrderFormSchema.safeParse(getOrderData(formData));

    if (!parsed.success) {
        return {
            errors: parsed.error.flatten().fieldErrors,
            message: 'Missing or invalid fields. Failed to update Order.',
        };
    }

    const { customer_id, description, price, status, payment_status } = parsed.data;

    try {
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return { message: 'Unauthorized: You must be logged in.' };
        }

        // `paid_at` was only ever written on insert, so an order edited into 'paid' kept a
        // null timestamp and dropped out of the dashboard revenue totals. Keep it in sync
        // here, reusing the original timestamp so unrelated edits don't move the paid date.
        const { data: existingOrder, error: fetchError } = await supabase
            .from('orders')
            .select('paid_at')
            .eq('id', id)
            .eq('user_id', user.id)
            .single();

        if (fetchError || !existingOrder) {
            console.error("Supabase select order error:", fetchError);
            return { message: 'Database error: Failed to update order.' };
        }

        const paidAt =
            payment_status === 'paid'
                ? existingOrder.paid_at ?? new Date().toISOString()
                : null;

        const { error } = await supabase
            .from('orders')
            .update({
                customer_id,
                description,
                price,
                status,
                payment_status,
                paid_at: paidAt,
            })
            .eq('id', id)
            .eq('user_id', user.id);

        if (error) {
            console.error("Supabase update error:", error);
            return { message: 'Database error: Failed to update order.' };
        }

        revalidatePath('/dashboard/orders');
        revalidatePath('/dashboard');
        return { success: true, message: 'Order updated successfully!' };
    } catch (error) {
        console.error("Unexpected error:", error);
        return {
            message: 'Database Error: Failed to update order.'
        };
    }
}

const OrderStatusSchema = z.enum(["quote_sent", "approved", "in_progress", "delivered"]);

// Used by the drag-and-drop order board, which only ever changes an order's workflow
// stage. Kept separate from updateOrder so a drop doesn't have to round-trip the whole
// order form just to move a card between columns.
export async function updateOrderStatus(id: string, status: string) {
    const supabase = await createClient();
    const parsedStatus = OrderStatusSchema.safeParse(status);

    if (!parsedStatus.success) {
        return { success: false, message: 'Invalid order status.' };
    }

    try {
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return { success: false, message: 'Unauthorized: You must be logged in.' };
        }

        const { error } = await supabase
            .from('orders')
            .update({ status: parsedStatus.data })
            .eq('id', id)
            .eq('user_id', user.id);

        if (error) {
            console.error("Supabase update order status error:", error);
            return { success: false, message: 'Database error: Failed to move order.' };
        }

        revalidatePath('/dashboard/orders/board');
        revalidatePath('/dashboard/orders');
        return { success: true, message: 'Order moved.' };
    } catch (error) {
        console.error("Unexpected error:", error);
        return { success: false, message: 'Database error: Failed to move order.' };
    }
}
