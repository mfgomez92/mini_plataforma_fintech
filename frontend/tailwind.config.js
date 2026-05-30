/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        belo: {
          green: '#00FFB2',
          purple: '#6B00F9',
          dark: {
            base: '#0B0E14',
            surface: '#151A23',
            border: '#2A2E39',
          },
          light: {
            text: '#FFFFFF',
            muted: '#9CA3AF',
          },
          semantic: {
            error: '#FF3B30',
            warning: '#FFB200',
          },
        },
      },
      minHeight: {
        touch: '48px',
      },
      minWidth: {
        touch: '48px',
      },
      borderRadius: {
        'xl': '1rem',
        '2xl': '1.5rem',
        '3xl': '2rem',
        'full': '9999px',
      },
      fontFamily: {
        sans: ['Poppins', 'Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}