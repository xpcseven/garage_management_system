/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      // colors: {
      //   primary: "var(--primary)",
      //   secondary: "var(--secondary)",
      //   savecolor: "var(--save)",
      //   titlecolor: "var(--title)",
      // },

      keyframes: {
        gradientMove: {
          "0%": { backgroundPosition: "0% 50%" },
          "100%": { backgroundPosition: "200% 50%" },
        },
      },
      animation: {
        gradientMove: "gradientMove 2s infinite",
      },

      screens: {
        print: { raw: "print" },
      },
      colors: {
        primary: "#009ee7",
        secondary: "#bb4c2a",
        savecolor: "#e8b202",
        titlecolor: "#FFFFFF",
        colorthree: "#0282c2",
        hussam2: "#000000",
        sky1: "#065985",
      },
      boxShadow: {
        neonsky:
          "0 0 10px theme('colors.white'), 0 0 50px theme('colors.sky.700')",
        neonyellow:
          "0 0 5px theme('colors.yellow.200'), 0 0 20px theme('colors.yellow.700')",
      },
    },
    fontFamily: {
      cairo: ["CairoFont", "sans-serif"],
    },
  },
  plugins: [],
};
