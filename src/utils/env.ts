// src/utils/env.ts
import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  server: {
    NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
    BREVO_API_KEY: z
      .string()
      .min(1)
      .default("dev_brevo_key_placeholder"), // Prevents crash during local dev
    APP_URL: z
      .string()
      .url()
      .default("http://localhost:3000"),
  },
  client: {
    NEXT_PUBLIC_APP_URL: z
      .string()
      .url()
      .default("http://localhost:3000"),
  },
  runtimeEnv: {
    NODE_ENV: process.env.NODE_ENV,
    BREVO_API_KEY: process.env.BREVO_API_KEY,
    APP_URL: process.env.APP_URL,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  },
  skipValidation: !!process.env.SKIP_ENV_VALIDATION,
  emptyStringAsUndefined: true,
});