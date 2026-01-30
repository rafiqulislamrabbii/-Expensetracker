import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: 'class',
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Noto Sans Bengali"', 'sans-serif'],
      },
      colors: {
        slate: {
            850: '#1e293b',
            900: '#0f172a',
        },
        primary: {
            DEFAULT: "#6366F1", // Indigo 500
            50: "#eef2ff",
            100: "#e0e7ff",
            200: "#c7d2fe",
            300: "#a5b4fc",
            400: "#818cf8",
            500: "#6366f1",
            600: "#4f46e5",
            700: "#4338ca",
            800: "#3730a3",
            900: "#312e81",
        },
        secondary: "#F59E0B", // Amber 500
        success: "#10B981", // Emerald 500
        danger: "#EF4444", // Red 500
      }
    },
  },
  plugins: [],
};
export default config;