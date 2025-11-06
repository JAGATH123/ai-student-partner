/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cyber: {
          black: '#0a0e27',
          darkest: '#0d1117',
          darker: '#161b22',
          dark: '#1c1f2e',
          navy: '#1a1d2e',
        },
        neon: {
          pink: '#ff006e',
          magenta: '#ff00ff',
          cyan: '#00ffff',
          blue: '#00d4ff',
          purple: '#b026ff',
          green: '#39ff14',
          yellow: '#ffff00',
          orange: '#ff6c00',
        },
        glow: {
          pink: 'rgba(255, 0, 110, 0.5)',
          cyan: 'rgba(0, 255, 255, 0.5)',
          purple: 'rgba(176, 38, 255, 0.5)',
          green: 'rgba(57, 255, 20, 0.5)',
        }
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
        'glow-pulse': 'glowPulse 2s ease-in-out infinite',
        'slide-up': 'slideUp 0.5s ease-out',
        'fade-in': 'fadeIn 0.3s ease-in',
        'glitch': 'glitch 0.5s infinite',
        'scan': 'scan 8s linear infinite',
        'flicker': 'flicker 3s linear infinite',
        'neon-pulse': 'neonPulse 1.5s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        glow: {
          '0%': { boxShadow: '0 0 5px #00ffff, 0 0 10px #00ffff' },
          '100%': { boxShadow: '0 0 20px #00ffff, 0 0 30px #00ffff, 0 0 40px #00ffff' },
        },
        glowPulse: {
          '0%, 100%': {
            boxShadow: '0 0 5px currentColor, 0 0 10px currentColor',
            filter: 'brightness(1)'
          },
          '50%': {
            boxShadow: '0 0 20px currentColor, 0 0 30px currentColor, 0 0 40px currentColor',
            filter: 'brightness(1.2)'
          },
        },
        slideUp: {
          '0%': { transform: 'translateY(100%)', opacity: 0 },
          '100%': { transform: 'translateY(0)', opacity: 1 },
        },
        fadeIn: {
          '0%': { opacity: 0 },
          '100%': { opacity: 1 },
        },
        glitch: {
          '0%': { transform: 'translate(0)' },
          '20%': { transform: 'translate(-2px, 2px)' },
          '40%': { transform: 'translate(-2px, -2px)' },
          '60%': { transform: 'translate(2px, 2px)' },
          '80%': { transform: 'translate(2px, -2px)' },
          '100%': { transform: 'translate(0)' },
        },
        scan: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100vh)' },
        },
        flicker: {
          '0%, 100%': { opacity: 1 },
          '41.99%': { opacity: 1 },
          '42%': { opacity: 0 },
          '43%': { opacity: 0 },
          '43.01%': { opacity: 1 },
          '47.99%': { opacity: 1 },
          '48%': { opacity: 0 },
          '49%': { opacity: 0 },
          '49.01%': { opacity: 1 },
        },
        neonPulse: {
          '0%, 100%': {
            textShadow: '0 0 10px currentColor, 0 0 20px currentColor, 0 0 30px currentColor'
          },
          '50%': {
            textShadow: '0 0 20px currentColor, 0 0 30px currentColor, 0 0 40px currentColor, 0 0 50px currentColor'
          },
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'cyber-gradient': 'linear-gradient(135deg, #00ffff 0%, #ff00ff 100%)',
        'neon-gradient': 'linear-gradient(90deg, #00ffff, #ff00ff, #00ffff)',
        'cyberpunk': 'linear-gradient(to right, #00d4ff, #b026ff, #ff006e, #39ff14)',
        'grid-pattern': 'linear-gradient(rgba(0, 255, 255, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 255, 255, 0.1) 1px, transparent 1px)',
      },
      backgroundSize: {
        'grid': '50px 50px',
      },
    },
  },
  plugins: [],
}
