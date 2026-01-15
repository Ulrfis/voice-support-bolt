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
        'spicy-sweetcorn': '#F7AA01',
        'rockman-blue': '#34A0ED',
        'chunky-bee': '#FDC64B',
        'joust-blue': '#51ADFB',
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
