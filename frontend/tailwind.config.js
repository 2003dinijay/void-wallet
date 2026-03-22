/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'void-bg': '#0a0a0f',
        'void-surface': '#12121a',
        'void-border': '#1e1e2e',
        'eth-green': '#00ff88',
        'sol-purple': '#9945ff',
        'void-muted': '#4a4a6a',
        'void-text': '#c8c8e8',
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
        display: ['Syne', 'sans-serif'],
      },
      animation: {
        'glow-green': 'glowGreen 2s ease-in-out infinite alternate',
        'glow-purple': 'glowPurple 2s ease-in-out infinite alternate',
        'fade-in': 'fadeIn 0.4s ease-in',
        'slide-up': 'slideUp 0.4s ease-out',
      },
      keyframes: {
        glowGreen: {
          '0%': { boxShadow: '0 0 5px #00ff8844' },
          '100%': { boxShadow: '0 0 20px #00ff8888, 0 0 40px #00ff8844' },
        },
        glowPurple: {
          '0%': { boxShadow: '0 0 5px #9945ff44' },
          '100%': { boxShadow: '0 0 20px #9945ff88, 0 0 40px #9945ff44' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}
