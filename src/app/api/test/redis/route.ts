// app/api/redis-test/route.ts
import redis from "@/lib/redis/redis";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    // 1. Set a test key with a 10-second expiration
    await redis.set("test_key", "Redis is working!", "EX", 10);

    // 2. Read the test key back
    const value = await redis.get("test_key");

    return NextResponse.json({ success: true, message: value });
  } catch (error) {
    console.error("Redis Connection Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to connect to Redis" },
      { status: 500 }
    );
  }
}