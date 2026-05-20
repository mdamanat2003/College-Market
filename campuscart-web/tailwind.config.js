/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      boxShadow: {
        glow: '0 0 40px rgba(84, 105, 255, 0.28)',
        neon: '0 0 80px rgba(132, 92, 255, 0.28)',
      },
      backgroundImage: {
        'hero-radial': 'radial-gradient(circle at top, rgba(84, 105, 255, 0.24), transparent 45%), radial-gradient(circle at 80% 20%, rgba(168, 85, 247, 0.22), transparent 30%)',
      },
    },
  },
  plugins: [],
};
