'use server'

import { createClient } from "@/lib/supabase/server";
import { Testimonial } from "../types/dashBoardTypes";

export async function getTestimonials( locale = "en"): Promise<Testimonial[]> {
const supabase = await createClient();
  
  const { data, error } = await supabase
    .from("testimonials")
    .select("*")
    .eq("locale", locale)
    .order("display_order", { ascending: true });

  if (error) {
    console.error("Error fetching testimonials:", error.message);
    return [];
  }

  return data || [];
}