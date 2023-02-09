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
        'bone': '#E1EDF2',
        'blue': '#00A3FF',
        'blue-muted': '#CCEAFF',
        'yellow': '#FFB800',
        'yellow-muted': '#FFF5D3',
        'green': '#00C696',
        'green-muted': '#C8F0E7',
        'pink': '#FF3CC8',
        'pink-muted': '#FBE5FF',
        'pink-vivid': '#FB3EFF',
        'red': '#FC3364',
        'red-muted': '#FFEDED',
        'void': '#010509',
        'linear': '#212931',
      },
      gridTemplateColumns: {
        'votation': 'repeat(3, minmax(0, 300px))',
      }
    },
    fontFamily: {
      'display': ['SohneBreit'],
    }
  },
  plugins: [],
};
