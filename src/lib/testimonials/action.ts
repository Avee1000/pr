'use server'

import { createClient } from "@/lib/supabase/server";
import { Testimonial } from "../supabase/types";
import { getCache, setCache, CacheKeys, TTL_SECONDS } from "@/lib/redis/cache";

export async function getTestimonials( locale = "en"): Promise<Testimonial[]> {
const supabase = await createClient();

  const cacheKey = CacheKeys.testimonials(locale);

  const cached = await getCache<Testimonial[]>(cacheKey);
  if (cached !== null) return cached;
  
  const { data, error } = await supabase
    .from("testimonials")
    .select("*")
    .eq("locale", locale)
    .order("display_order", { ascending: true });

  if (error) {
    console.error("Error fetching testimonials:", error.message);
    await setCache(cacheKey, [], TTL_SECONDS.LONG);
    return [];
  }

  const result = data || [];
  await setCache(cacheKey, result, TTL_SECONDS.LONG);
  return result;
}