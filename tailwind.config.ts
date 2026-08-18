
import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontSize: {
        // sm: 'clamp(0.8rem, 0.75rem + 0.25vw, 0.875rem)',   // Scales between ~12.8px and 14px
        // base: 'clamp(0.9rem, 0.85rem + 0.3vw, 1rem)',       // Scales between ~14.4px and 16px
        // lg: 'clamp(1rem, 0.95rem + 0.4vw, 1.125rem)',       // Scales between 16px and 18px
        // xl: 'clamp(1.125rem, 1.05rem + 0.6vw, 1.25rem)',    // Scales between 18px and 20px
        // '2xl': 'clamp(1.25rem, 1.15rem + 0.9vw, 1.5rem)',   // Scales between 20px and 24px
        // '3xl': 'clamp(1.5rem, 1.3rem + 1.3vw, 1.875rem)',   // Scales between 24px and 30px
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
