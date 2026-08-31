import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        ink: "#1b1a17",
        parchment: "#f6f1e7",
        spice: "#b3542a",
        dune: "#8c7a5b",
      },
    },
  },
  plugins: [],
};

export default config;
