/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        blue: {
          DEFAULT: '#2557E6',
          deep: '#1B41B8',
          soft: '#8FB4FF',
        },
        navy: {
          DEFAULT: '#0C2440',
          2: '#0A1D33',
        },
        ink: '#13294A',
        mut: '#5B6C86',
        sky: '#F4F7FC',
        tint: '#E9F0FD',
        line: '#E2E9F3',
        'line-2': '#CBD7E8',
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', '"Helvetica Neue"', 'sans-serif'],
      },
      borderRadius: {
        xl: '28px',
        lg: '20px',
        md: '14px',
      },
      zIndex: {
        60: '60',
        70: '70',
        80: '80',
      },
    },
  },
  plugins: [],
};
