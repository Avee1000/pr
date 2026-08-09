import { NextResponse } from "next/server";
import { createClient } from '@/lib/supabase/server';

export async function GET() {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
        throw new Error("Unauthorized: User not logged in.");
    }

    try {
        const { data, error } = await supabase
            .rpc('get_quote_by_id', { p_quote_id: '95414a91-cfa9-4012-adbc-0fc2465de1fa' })
            .maybeSingle();

        console.log('rpc data:', data);
        console.log('rpc error:', error);

        if (error) throw error;
        if (!data) {
            return NextResponse.json({ message: 'Quote not found or access denied.' }, { status: 404 });
        }

        return NextResponse.json(data);
    } catch (e: any) {
        console.error("Unexpected error:", e);
        return NextResponse.json({ message: e?.message ?? "Unknown error", details: e }, { status: 500 });
    }
}