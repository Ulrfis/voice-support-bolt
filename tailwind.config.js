/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        'grotesk': ['Space Grotesk', 'sans-serif'],
        'inter': ['Inter', 'sans-serif'],
      },
      colors: {
        'spicy-sweetcorn': 'rgb(var(--color-spicy-sweetcorn) / <alpha-value>)',
        'rockman-blue': 'rgb(var(--color-rockman-blue) / <alpha-value>)',
        'chunky-bee': 'rgb(var(--color-chunky-bee) / <alpha-value>)',
        'joust-blue': 'rgb(var(--color-joust-blue) / <alpha-value>)',
        'charcoal': '#1A1A1A',
        'slate': '#4A4A4A',
        'silver': '#9CA3AF',
        'light-gray': '#E5E7EB',
        'off-white': '#F9FAFB',
      },
      borderRadius: {
        'DEFAULT': '8px',
      },
    },
  },
  plugins: [],
};
