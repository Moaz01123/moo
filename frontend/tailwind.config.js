/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#0d0d0d",
        carbon: "#1a1a1a",
        smoke: "#8a8a8a",
        ash: "#e7e3dc",
        bone: "#f4f1ea",
        sand: "#d8cfc2",
        beige: "#cfc4b2",
      },
      fontFamily: {
        display: ['Anton', 'Arial Narrow', 'sans-serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      letterSpacing: {
        tightest: "-0.04em",
        ultra: "0.35em",
      },
      keyframes: {
        marquee: {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
        fadeup: {
          "0%": { opacity: "0", transform: "translateY(24px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        fadein: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
      },
      animation: {
        marquee: "marquee 28s linear infinite",
        fadeup: "fadeup 0.7s cubic-bezier(0.16,1,0.3,1) both",
        fadein: "fadein 0.9s ease both",
      },
    },
  },
  plugins: [],
};
