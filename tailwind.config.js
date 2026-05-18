/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      keyframes: {
        'kbd-press': {
          '0%':   { transform: 'scale(1)' },
          '40%':  { transform: 'scale(0.91)' },
          '100%': { transform: 'scale(1)' },
        },
        'kbd-slide-up': {
          from: { transform: 'translateY(100%)' },
          to:   { transform: 'translateY(0)' },
        },
        'kbd-slide-down': {
          from: { transform: 'translateY(0)' },
          to:   { transform: 'translateY(100%)' },
        },
        'modal-in': {
          from: { opacity: '0', transform: 'scale(0.95)' },
          to:   { opacity: '1', transform: 'scale(1)' },
        },
      },
      animation: {
        'kbd-press':      'kbd-press 120ms ease-out',
        'kbd-slide-up':   'kbd-slide-up 180ms ease-out',
        'kbd-slide-down': 'kbd-slide-down 150ms ease-in forwards',
        'modal-in':       'modal-in 140ms ease-out',
      },
    },
  },
  plugins: [],
}
