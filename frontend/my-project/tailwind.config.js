export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        navy: '#1e2a4a',
      },
    },
  },
  plugins: [require('@tailwindcss/typography')],
}