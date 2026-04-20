/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          50: "#f0e9ff",
          100: "#d9c7ff",
          200: "#b899ff",
          300: "#9c6bff",
          400: "#8347ff",
          500: "#6c22ff",
          600: "#5a14e0",
          700: "#4710b8",
          800: "#350d90",
          900: "#220a68",
        },
        accent: {
          400: "#22d3ee",
          500: "#06b6d4",
          600: "#0891b2",
        },
        surface: {
          900: "#0d0d1a",
          800: "#12122a",
          700: "#1a1a35",
          600: "#242444",
        },
        glass: "rgba(255,255,255,0.05)",
      },
      backgroundImage: {
        "glass-card":
          "linear-gradient(135deg, rgba(255,255,255,0.07), rgba(255,255,255,0.02))",
        "gradient-brand": "linear-gradient(135deg, #6c22ff 0%, #22d3ee 100%)",
        "gradient-page":
          "radial-gradient(ellipse at top left, #1a0a3d 0%, #0d0d1a 50%, #001a2e 100%)",
      },
      boxShadow: {
        glass:
          "0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.08)",
        glow: "0 0 20px rgba(108,34,255,0.4)",
        "glow-sm": "0 0 10px rgba(108,34,255,0.3)",
        "glow-cyan": "0 0 20px rgba(34,211,238,0.3)",
        card: "0 4px 24px rgba(0,0,0,0.5)",
      },
      backdropBlur: {
        glass: "12px",
      },
      borderRadius: {
        "2xl": "1rem",
        "3xl": "1.5rem",
        "4xl": "2rem",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        display: ["Plus Jakarta Sans", "sans-serif"],
      },
      animation: {
        "fade-in": "fadeIn 0.3s ease-out",
        "slide-up": "slideUp 0.4s ease-out",
        "slide-in": "slideIn 0.3s ease-out",
        "pulse-glow": "pulseGlow 2s ease-in-out infinite",
        float: "float 3s ease-in-out infinite",
      },
      keyframes: {
        fadeIn: { from: { opacity: 0 }, to: { opacity: 1 } },
        slideUp: {
          from: { transform: "translateY(20px)", opacity: 0 },
          to: { transform: "translateY(0)", opacity: 1 },
        },
        slideIn: {
          from: { transform: "translateX(-20px)", opacity: 0 },
          to: { transform: "translateX(0)", opacity: 1 },
        },
        pulseGlow: {
          "0%,100%": { boxShadow: "0 0 10px rgba(108,34,255,0.3)" },
          "50%": { boxShadow: "0 0 25px rgba(108,34,255,0.7)" },
        },
        float: {
          "0%,100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-6px)" },
        },
      },
    },
  },
  plugins: [],
};

