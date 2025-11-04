/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'primary': '#6366f1',
        'primary-hover': '#4f46e5',
        'secondary': '#1f2937',
        'background': '#111827',
        'card': '#1f2937',
        'text-main': '#f9fafb',
        'text-secondary': '#9ca3af',
      },
    },
  },
  plugins: [],
}
