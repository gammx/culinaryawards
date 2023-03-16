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
        'void': 'rgb(var(--void) / <alpha-value>)',
        'void-high': 'rgb(var(--void-high) / <alpha-value>)',
        'void-higher': 'rgb(var(--void-higher) / <alpha-value>)',
        'linear': 'rgb(var(--linear) / <alpha-value>)',
        'linear-secondary': 'rgb(var(--linear-secondary) / <alpha-value>)',
        'linear-tertiary': 'rgb(var(--linear-tertiary) / <alpha-value>)',
        'ink': 'rgb(var(--ink) / <alpha-value>)',
        'ink-secondary': 'rgb(var(--ink-secondary) / <alpha-value>)',
        'ink-muted': 'rgb(var(--ink-muted) / <alpha-value>)',
        'ink-tertiary': 'rgb(var(--ink-tertiary) / <alpha-value>)',
        'pastel-pink': 'rgb(var(--pastel-pink) / <alpha-value>)',
        'pastel-red': 'rgb(var(--pastel-red) / <alpha-value>)',
        'pastel-green': 'rgb(var(--pastel-green) / <alpha-value>)',
        'pastel-blue': 'rgb(var(--pastel-blue) / <alpha-value>)',
        'pastel-yellow': 'rgb(var(--pastel-yellow) / <alpha-value>)',
        'pastel-purple': 'rgb(var(--pastel-purple) / <alpha-value>)',
        'neon-blue': 'rgb(var(--neon-blue) / <alpha-value>)',
        'neon-green': 'rgb(var(--neon-green) / <alpha-value>)',
        'neon-yellow': 'rgb(var(--neon-yellow) / <alpha-value>)',
        'neon-pink': 'rgb(var(--neon-pink) / <alpha-value>)',
        'neon-purple': 'rgb(var(--neon-purple) / <alpha-value>)',
        'pink': '#FF3CC8',
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
