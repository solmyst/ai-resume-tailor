/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: '#12121B',
          soft: '#2A2A3D',
        },
        slate: {
          DEFAULT: '#4A4A62',
        },
        fog: {
          DEFAULT: '#F3EFE8',
        },
        stone: {
          DEFAULT: '#E6E0D5',
        },
        linen: {
          DEFAULT: '#D3C9B7',
        },
        ember: {
          DEFAULT: '#B87C38',
          deep: '#8A5C24',
          light: '#E8C98A',
        },
      },
    },
  },
  plugins: [],
};
