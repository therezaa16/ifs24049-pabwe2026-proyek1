/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{vue,js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: 'rgb(var(--brand-50) / <alpha-value>)',
          100: 'rgb(var(--brand-100) / <alpha-value>)',
          200: 'rgb(var(--brand-200) / <alpha-value>)',
          300: 'rgb(var(--brand-300) / <alpha-value>)',
          400: 'rgb(var(--brand-400) / <alpha-value>)',
          500: 'rgb(var(--brand-500) / <alpha-value>)',
          600: 'rgb(var(--brand-600) / <alpha-value>)',
          700: 'rgb(var(--brand-700) / <alpha-value>)',
          800: 'rgb(var(--brand-800) / <alpha-value>)',
          900: 'rgb(var(--brand-900) / <alpha-value>)',
        },
        brass: {
          50: 'rgb(var(--brass-50) / <alpha-value>)',
          100: 'rgb(var(--brass-100) / <alpha-value>)',
          200: 'rgb(var(--brass-200) / <alpha-value>)',
          300: 'rgb(var(--brass-300) / <alpha-value>)',
          400: 'rgb(var(--brass-400) / <alpha-value>)',
          500: 'rgb(var(--brass-500) / <alpha-value>)',
          600: 'rgb(var(--brass-600) / <alpha-value>)',
          700: 'rgb(var(--brass-700) / <alpha-value>)',
          800: 'rgb(var(--brass-800) / <alpha-value>)',
          900: 'rgb(var(--brass-900) / <alpha-value>)',
        }
      },
      fontFamily: {
        display: ['"Bricolage Grotesque"', 'Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
        body: ['"Instrument Sans"', 'Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'neo': '0 2px 0 #1e293b',
        'card': '0 1px 3px 0 rgb(0 0 0 / 0.05), 0 1px 2px -1px rgb(0 0 0 / 0.05)',
        'elevated': '0 10px 25px -5px rgb(15 23 42 / 0.08), 0 8px 10px -6px rgb(15 23 42 / 0.04)',
      }
    },
  },
  plugins: [],
}
