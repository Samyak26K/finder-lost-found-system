import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
    './services/**/*.{js,ts,jsx,tsx}',
    './types.ts',
    './App.tsx'
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};

export default config;

