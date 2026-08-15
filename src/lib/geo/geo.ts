'use server'

import { headers } from 'next/headers';
import axios from 'axios';


export async function getClientCountry(): Promise<string> {
  try {
    const headerList = await headers();

    // 1. Primary: Vercel attached header (ISO 3166-1 alpha-2 code, e.g., "US", "DE", "GH")
    const vercelCountry = headerList.get("x-vercel-ip-country");
    if (vercelCountry && vercelCountry !== "XX") {
      return vercelCountry.toUpperCase();
    }

    // 2. Cloudflare / Generic proxy fallback (if behind additional reverse proxies)
    const cfCountry = headerList.get("cf-ipcountry");
    if (cfCountry && cfCountry !== "XX") {
      return cfCountry.toUpperCase();
    }

    // 3. Fallback for localhost / local development environment
    return "US"; 
  } catch (err) {
    console.error("Error reading geolocation headers:", err);
    return "US"; // Fail open so signup never blocks
  }
}

export async function fetchUserLocation() {
  try {
    const backendUrl =
      process.env.NEXT_PUBLIC_FASTAPI_URL ??
      process.env.FASTAPI_URL ??
      "http://127.0.0.1:8000";

    const response = await axios.get(`${backendUrl}/api/v1/user-location`);
    const result = response.data;
    console.log(result)

    if (result.status === "success") {
      console.log("User IP:", result.data.ip);
      console.log("User Country:", result.data.country_code);
      return result;
    } else {
      console.error("Failed to fetch location:", result.message);
      return null;
    }
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error("Axios HTTP Error:", error.response?.data || error.message);
    } else {
      console.error("Failed to fetch location:", error);
    }
    return null;
  }
}

