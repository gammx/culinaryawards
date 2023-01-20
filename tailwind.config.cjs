/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      gridTemplateRows: {
        '12': 'repeat(12, minmax(0, 1fr))',
      },
      borderRadius: {
        'circle': '50%',
      },
      colors: {
        'bone': '#C9D9DE',
        'blue': '#00A3FF',
        'blue-muted': '#CCEAFF',
        'yellow': '#FFB800',
        'yellow-muted': '#FFF5D3',
        'green': '#00FFB2',
        'green-muted': '#001612',
        'pink': '#FF3CC8',
        'pink-muted': '#FBE5FF',
      }
    },
  },
  plugins: [],
};
