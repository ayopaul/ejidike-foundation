/** @type {import('tailwindcss').Config} */

module.exports = {
  content: [
    "./app/**/*.{ts,tsx,js,jsx}",
    "./components/**/*.{ts,tsx,js,jsx}",
    "./pages/**/*.{ts,tsx,js,jsx}",
  ],
  darkMode: "class", // enables `.dark` class usage
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        card: "var(--card)",
        'card-foreground': "var(--card-foreground)",
        popover: "var(--popover)",
        'popover-foreground': "var(--popover-foreground)",
        primary: "var(--primary)",
        'primary-foreground': "var(--primary-foreground)",
        secondary: "var(--secondary)",
        'secondary-foreground': "var(--secondary-foreground)",
        muted: "var(--muted)",
        'muted-foreground': "var(--muted-foreground)",
        accent: "var(--accent)",
        'accent-foreground': "var(--accent-foreground)",
        destructive: "var(--destructive)",
        border: "var(--border)",
        input: "var(--input)",
        ring: "var(--ring)",
        sidebar: "var(--sidebar)",
        'sidebar-foreground': "var(--sidebar-foreground)",
        'sidebar-primary': "var(--sidebar-primary)",
        'sidebar-primary-foreground': "var(--sidebar-primary-foreground)",
        'sidebar-accent': "var(--sidebar-accent)",
        'sidebar-accent-foreground': "var(--sidebar-accent-foreground)",
        'sidebar-border': "var(--sidebar-border)",
        'sidebar-ring': "var(--sidebar-ring)",
        'chart-1': "var(--chart-1)",
        'chart-2': "var(--chart-2)",
        'chart-3': "var(--chart-3)",
        'chart-4': "var(--chart-4)",
        'chart-5': "var(--chart-5)",
        // BRAND (from color guide)
        brand: {
          yellow: "#FFCF4C",      // Primary yellow from color guide
          yellowDark: "#EAB308",  // Darker variant
          blue: "#1C6FAF",        // Primary blue
          neonBlue: "#0080FF",    // Neon blue accent
        },

        // SURFACE / BACKGROUND
        surface: {
          cream: "#F7E9D6",     // Page background
          white: "#FFFFFF",
          card: "rgba(255,255,255,0.90)",
        },

        // TEXT
        text: {
          primary: "#111827",    // Slate-900
          secondary: "#374151",  // Slate-700
          muted: "#6B7280",      // Slate-500
          light: "#9CA3AF",      // Slate-400
        },

        // LAYOUT DARK SECTIONS
        dark: {
          DEFAULT: "#020617",   // Footer background
          deep: "#0B1220",      // Hero strip background
        },

        // BORDERS
        border: {
          default: "#E5E7EB",   // Slate-200
          card: "rgba(148,163,184,0.40)",
        },

        // GLOWS (subtle brand blobs)
        glow: {
          pink: "rgba(249,168,212,0.5)",
          blue: "rgba(59,130,246,0.45)",
        },
      },
      borderRadius: {
        sm: "calc(var(--radius) - 4px)",
        md: "calc(var(--radius) - 2px)",
        lg: "var(--radius)",
        xl: "calc(var(--radius) + 4px)",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "Poppins", "sans-serif"],
        mono: ["var(--font-geist-mono)", "monospace"],
        poppins: ["Poppins", "ui-sans-serif", "system-ui"],
      },
    },
  },
  plugins: [
    require("tailwindcss-animate"), // if you're using `tw-animate-css`
  ],
  fontSize: {
    xs: ["0.75rem", { lineHeight: "1.6" }],      // Label text
    sm: ["0.875rem", { lineHeight: "1.6" }],     // Body small
    base: ["1rem", { lineHeight: "1.8" }],
    lg: ["1.125rem", { lineHeight: "1.8" }],
    xl: ["1.25rem", { lineHeight: "1.8" }],
    "2xl": ["1.5rem", { lineHeight: "1.5" }],
    "3xl": ["1.875rem", { lineHeight: "1.5" }],
    "4xl": ["2.25rem", { lineHeight: "1.5" }],
    "5xl": ["3rem", { lineHeight: "1.3" }],
    "6xl": ["4rem", { lineHeight: "1.3" }],
    hero: ["4.25rem", { lineHeight: "1.5" }],    // EXACT MATCH TO PDF HERO
  },
  extend: {
    spacing: {
      4: "1rem",      // 16px
      5: "1.25rem",   // 20px
      6: "1.5rem",    // 24px
      7: "1.75rem",
      8: "2rem",      // 32px
      10: "2.5rem",   // 40px
      12: "3rem",     // 48px
      16: "4rem",     // 64px
      24: "6rem",     // 96px
      48: "12rem",    // 192px
      50: "12.5rem",  // 200px (Hero)
      72: "18rem",    // 288px
    },
    borderRadius: {
      card: "1.25rem", // 20px
      pill: "999px",
    },
    boxShadow: {
      card: "0 18px 40px rgba(15,23,42,0.18)",
      btn: "0 14px 30px rgba(180,83,9,0.28)",
      btnHover: "0 18px 40px rgba(180,83,9,0.40)",
    },
  },
};