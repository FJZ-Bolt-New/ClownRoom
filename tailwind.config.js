/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        'hand': ['Kalam', 'cursive'],
        'sketch': ['Caveat', 'cursive'],
      },
      colors: {
        primary: '#FF6B9D',
        secondary: '#4ECDC4',
        accent: '#FFE66D',
        orange: '#FF8A5B',
        purple: '#9B59B6',
        dark: '#1a1a2e',
        'dark-light': '#16213e',
        'dark-card': '#0f3460',
        'sketch-blue': '#3498db',
        'sketch-green': '#2ecc71',
        'sketch-red': '#e74c3c',
        'sketch-yellow': '#f1c40f',
        'sketch-purple': '#9b59b6',
        'doodle-pink': '#ff69b4',
        'doodle-cyan': '#00ffff',
        'doodle-lime': '#32cd32',
      },
      animation: {
        'bounce-slow': 'bounce 2s infinite',
        'bounce-doodle': 'bounce-doodle 2s ease-in-out infinite',
        'pulse-glow': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'wiggle': 'wiggle 2s ease-in-out infinite',
        'float': 'float-sketch 3s ease-in-out infinite',
        'scribble': 'scribble 2s ease-in-out',
      },
      keyframes: {
        wiggle: {
          '0%, 100%': { transform: 'rotate(-2deg) translateY(0px)' },
          '25%': { transform: 'rotate(1deg) translateY(-2px)' },
          '50%': { transform: 'rotate(-1deg) translateY(-1px)' },
          '75%': { transform: 'rotate(2deg) translateY(-3px)' },
        },
        'bounce-doodle': {
          '0%, 100%': { transform: 'translateY(0px) rotate(0deg)' },
          '50%': { transform: 'translateY(-8px) rotate(5deg)' },
        },
        'float-sketch': {
          '0%, 100%': { transform: 'translateY(0px) rotate(-2deg)' },
          '33%': { transform: 'translateY(-5px) rotate(1deg)' },
          '66%': { transform: 'translateY(-2px) rotate(-1deg)' },
        },
        scribble: {
          '0%': { 'stroke-dashoffset': '100' },
          '100%': { 'stroke-dashoffset': '0' },
        },
      },
      boxShadow: {
        'glow': '0 0 20px rgba(255, 107, 157, 0.3)',
        'glow-secondary': '0 0 20px rgba(78, 205, 196, 0.3)',
        'glow-accent': '0 0 20px rgba(255, 230, 109, 0.3)',
        'sketch': '3px 3px 0px rgba(0,0,0,0.2), 6px 6px 0px rgba(0,0,0,0.1)',
        'doodle': '2px 2px 8px rgba(0,0,0,0.3), inset 1px 1px 0px rgba(255,255,255,0.2)',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'paper-texture': 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.15) 1px, transparent 0)',
        'notebook-lines': 'linear-gradient(transparent 24px, rgba(255,255,255,0.1) 25px, rgba(255,255,255,0.1) 26px, transparent 27px)',
      },
      backgroundSize: {
        'paper': '20px 20px',
        'notebook': '100% 25px',
      },
    },
  },
  plugins: [],
};