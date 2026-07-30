/** @type {import('tailwindcss').Config} */

const config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      screens: {
        print: { raw: "print" },
      },
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        /** بنفسج آشور — هوية بنفسجية جديدة */
        plum: {
          DEFAULT: "#5B21B6",
          light: "#7C3AED",
          dark: "#3B0764",
          soft: "#EDE9FE",
        },
        orchid: {
          DEFAULT: "#8B5CF6",
          light: "#A78BFA",
          dark: "#6D28D9",
        },
        fuchsia: {
          brand: "#C026D3",
          soft: "#FAE8FF",
        },
        mist: {
          DEFAULT: "#F5F3FF",
          dark: "#EDE9FE",
          deep: "#DDD6FE",
        },
        dusk: {
          DEFAULT: "#1E1B4B",
          muted: "#312E81",
        },
        /** توافق مع المكوّنات التي تستخدم أسماء الرافدين سابقاً */
        rafidain: {
          DEFAULT: "#5B21B6",
          light: "#7C3AED",
          dark: "#3B0764",
        },
        palm: {
          DEFAULT: "#6D28D9",
          light: "#8B5CF6",
        },
        date: {
          DEFAULT: "#A855F7",
          light: "#C084FC",
        },
        clay: {
          DEFAULT: "#C026D3",
        },
        sand: {
          DEFAULT: "#F5F3FF",
          dark: "#EDE9FE",
        },
        ink: {
          DEFAULT: "#1E1B4B",
        },
        savecolor: "#A855F7",
        titlecolor: "#FFFFFF",
        colorthree: "#7C3AED",
        purple1: "#5B21B6",
        brand: {
          primary: "#5B21B6",
          secondary: "#A855F7",
        },
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      fontFamily: {
        sans: [
          "var(--font-cairo)",
          "system-ui",
          "Segoe UI",
          "Tahoma",
          "Arial",
          "sans-serif",
        ],
        body: [
          "var(--font-cairo)",
          "system-ui",
          "Segoe UI",
          "Tahoma",
          "Arial",
          "sans-serif",
        ],
        display: ["var(--font-display)", "var(--font-cairo)", "serif"],
        data: ["var(--font-data)", "var(--font-cairo)", "sans-serif"],
        cairo: ["var(--font-cairo)", "sans-serif"],
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      boxShadow: {
        plum: "0 8px 30px rgba(91, 33, 182, 0.18)",
        orchid: "0 4px 20px rgba(139, 92, 246, 0.22)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
