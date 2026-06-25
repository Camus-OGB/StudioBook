import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        'ima-primary': '#4527A0',
        'ima-primary-light': '#EDE7F6',
        'ima-primary-dark': '#311B92',
        'ima-accent': '#FFB300',
        'ima-accent-light': '#FFF8E1',
        // Tokens de la direction artistique
        'ima-ink': '#1c1430',
        'ima-muted': '#6b6478',
        'ima-faint': '#9a93ab',
        'ima-line': '#ecebf4',
        'ima-surface': '#f6f5fb',
        'ima-lilac': '#f3f0fb',
      },
      fontFamily: {
        sora: ['var(--font-sora)', 'sans-serif'],
        sans: ['var(--font-outfit)', 'system-ui', 'sans-serif'],
      },
      keyframes: {
        'ima-up': {
          from: { opacity: '0', transform: 'translateY(10px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'ima-up': 'ima-up .4s ease both',
      },
    },
  },
  plugins: [],
};
export default config;
