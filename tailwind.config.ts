import type { Config } from "tailwindcss";

/**
 * URBAN NOOR — light theme
 * Token names are semantic:
 *   noir  = SURFACES (page background, cards, subtle panels) — light cream / white / blush
 *   ivory = TEXT (deep plum) — use opacity for secondary text, e.g. text-ivory/60
 *   gold, magenta, royal (purple) = brand accents
 * To re-theme the whole store, change the hex values here.
 */
const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        noir: { DEFAULT: "#FFF8F3", 900: "#FFF8F3", 800: "#FFFFFF", 700: "#FAF0F6", 600: "#F2E4F0" },
        ivory: { DEFAULT: "#2B1238", 100: "#2B1238", 200: "#2B1238", 300: "#4A2D57" },
        gold: { DEFAULT: "#A8761A", light: "#E8B04A", dark: "#8A5F10", pale: "#FBEFD3" },
        magenta: { DEFAULT: "#C2186B", light: "#F06BAA", dark: "#9C1356", pale: "#FDE7F1" },
        royal: { DEFAULT: "#7B2FBE", light: "#B98AF0", dark: "#5A1E91", pale: "#F1E7FC" },
      },
      backgroundImage: {
        brand: "linear-gradient(120deg, #C2186B 0%, #9B2499 50%, #7B2FBE 100%)",
        "brand-gold": "linear-gradient(120deg, #E8B04A 0%, #C2186B 50%, #7B2FBE 100%)",
        "brand-soft": "linear-gradient(135deg, #FDE7F1 0%, #F1E7FC 50%, #FBEFD3 100%)",
      },
      fontFamily: {
        display: ["var(--font-display)", "Georgia", "serif"],
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
      },
      boxShadow: {
        glow: "0 12px 40px -10px rgba(194,24,107,0.45)",
        card: "0 24px 50px -24px rgba(91,30,145,0.28)",
        soft: "0 10px 30px -12px rgba(91,30,145,0.18)",
      },
      keyframes: {
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        marquee: {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
        float: {
          "0%,100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
        "gradient-x": {
          "0%,100%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
        },
      },
      animation: {
        shimmer: "shimmer 5s linear infinite",
        marquee: "marquee 30s linear infinite",
        float: "float 6s ease-in-out infinite",
        "gradient-x": "gradient-x 6s ease infinite",
      },
    },
  },
  plugins: [],
};

export default config;
