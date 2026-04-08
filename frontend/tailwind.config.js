/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        'bg-app': '#0a0a0f',
        'bg-surface': '#111118',
        'bg-elevated': '#1e1e2a',
        'border-subtle': '#374151',
        primary: '#6366f1',
        'primary-hover': '#818cf8',
        accent: '#22d3ee',
      },
    },
  },
  plugins: [require('@tailwindcss/forms')],
};
