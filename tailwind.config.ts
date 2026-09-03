import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#f0f7ff",
          100: "#e0effe",
          200: "#bae0fd",
          300: "#7cc8fb",
          400: "#36a9f7",
          500: "#0c8de4",
          600: "#026fc1",
          700: "#03599d",
          800: "#074c82",
          900: "#0c3f6d",
          950: "#082848",
        },
        gunmetal: {
          DEFAULT: "#080C18",
          900: "#0A0E1A",
          800: "#0F1425",
          700: "#141B2E",
          600: "#1A2340",
          500: "#1E2A4A",
          400: "#253656",
        },
        halo: {
          cyan: "#00E5FF",
          ice: "#7EEBFF",
          electric: "#00B8FF",
          steel: "#2A3F5F",
        },
        vice: {
          pink: "#FF2E97",
          magenta: "#FF0A6C",
          orange: "#FF7A00",
          violet: "#7C3AED",
          sunset: "#FF6B6B",
          neon: "#FFE600",
        },
        darkbg: "#080C18",
        darkcard: "#111827",
        darkborder: "#1F2937",
      },
      fontFamily: {
        display: ["Anton", "Bebas Neue", "Impact", "sans-serif"],
        tech: ["Rajdhani", "Orbitron", "sans-serif"],
        mono: ["JetBrains Mono", "Share Tech Mono", "monospace"],
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "glass-gradient": "linear-gradient(135deg, rgba(255, 255, 255, 0.05), rgba(255, 255, 255, 0.01))",
        "vice-sunset": "linear-gradient(135deg, #FF2E97 0%, #FF7A00 50%, #7C3AED 100%)",
        "halo-sweep": "linear-gradient(90deg, transparent, rgba(0,229,255,0.4), transparent)",
        "armor-gradient": "linear-gradient(180deg, #141B2E 0%, #0F1425 100%)",
      },
      clipPath: {
        chamfer: "polygon(12px 0, 100% 0, 100% calc(100% - 12px), calc(100% - 12px) 100%, 0 100%, 0 12px)",
        chamferLg: "polygon(18px 0, 100% 0, 100% calc(100% - 18px), calc(100% - 18px) 100%, 0 100%, 0 18px)",
      },
      keyframes: {
        scan: {
          "0%": { transform: "translateY(-100%)" },
          "100%": { transform: "translateY(300%)" },
        },
        flicker: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.85" },
        },
        drift: {
          "0%": { transform: "translateX(-2%)" },
          "100%": { transform: "translateX(2%)" },
        },
        marquee: {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
        glowPulse: {
          "0%, 100%": { boxShadow: "0 0 18px rgba(0,229,255,0.35), inset 0 0 12px rgba(0,229,255,0.08)" },
          "50%": { boxShadow: "0 0 28px rgba(0,229,255,0.55), inset 0 0 18px rgba(0,229,255,0.14)" },
        },
      },
      animation: {
        scan: "scan 3s linear infinite",
        flicker: "flicker 2.5s ease-in-out infinite",
        marquee: "marquee 24s linear infinite",
        "glow-pulse": "glowPulse 2.2s ease-in-out infinite",
      },
      boxShadow: {
        halo: "0 0 22px rgba(0,229,255,0.35), 0 0 2px rgba(0,229,255,0.9)",
        "halo-strong": "0 0 32px rgba(0,229,255,0.5), inset 0 0 14px rgba(0,229,255,0.12)",
        vice: "0 0 26px rgba(255,46,151,0.45), 0 0 8px rgba(255,122,0,0.3)",
      },
    },
  },
  plugins: [],
};
export default config;
