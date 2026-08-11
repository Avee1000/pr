import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { delCache, CacheKeys } from "@/lib/redis/cache";

interface RouteContext {
  params: Promise<{ token: string }>;
}
  
export async function POST(_request: Request, { params }: RouteContext) {
  const { token } = await params;
  const supabase = await createClient();

  const { data, error } = await supabase.rpc("approve_quote_by_token", { p_token: token });

  if (error) {
    return NextResponse.json({ message: "Quote not found." }, { status: 404 });
  }

  const row = Array.isArray(data) ? data[0] : data;
  if (!row) {
    return NextResponse.json({ message: "Quote not found." }, { status: 404 });
  }

  delCache(CacheKeys.quote(token)).catch(() => {});

  return NextResponse.json(
    { status: row.quote_status, approvedAt: row.approved_at },
    { status: 200 },
  );
}
