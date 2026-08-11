// lib/redis.ts
import Redis from "ioredis";

const redisClientSingleton = () => {
  const client = new Redis(process.env.REDIS_URL || "redis://127.0.0.1:6379", {
    // Optional: Prevent ioredis from retrying endlessly if Redis goes down
    maxRetriesPerRequest: 3,
  });

  // Attach an error listener to prevent unhandled error event crashes
  client.on("error", (err) => {
    console.error("Redis Connection Error:", err.message);
  });

  return client;
};

declare global {
  var redis: undefined | ReturnType<typeof redisClientSingleton>;
}

const redis = globalThis.redis ?? redisClientSingleton();

export default redis;

if (process.env.NODE_ENV !== "production") globalThis.redis = redis;