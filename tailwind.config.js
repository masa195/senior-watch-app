/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // シニアフレンドリーな色設計
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        },
        success: {
          50: '#f0fdf4',
          100: '#dcfce7',
          500: '#22c55e',
          600: '#16a34a',
        },
        warning: {
          50: '#fffbeb',
          100: '#fef3c7',
          500: '#f59e0b',
          600: '#d97706',
        },
        danger: {
          50: '#fef2f2',
          100: '#fee2e2',
          500: '#ef4444',
          600: '#dc2626',
        }
      },
      fontSize: {
        // シニア向け大きめフォント
        'senior-sm': '1.125rem',
        'senior-base': '1.25rem',
        'senior-lg': '1.5rem',
        'senior-xl': '1.875rem',
        'senior-2xl': '2.25rem',
        'senior-3xl': '3rem',
      },
      spacing: {
        // タップしやすい大きめスペーシング
        'touch': '3rem',
        'touch-lg': '4rem',
      }
    },
  },
  plugins: [],
}
