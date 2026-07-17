/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          50:  '#FAF7FF', // Background
          100: '#EDE9FE', // Highlight
          200: '#DDD6FE', // Secondary
          300: '#C4B5FD', // Primary
          400: '#A78BFA',
          500: '#8B5CF6', // Accent
          600: '#7C3AED',
          700: '#6D28D9',
          800: '#5B21B6',
          900: '#312E81', // Primary Text
          950: '#1E1B4B',
        },
        secondary: {
          DEFAULT: '#DDD6FE',
        },
        accent: {
          DEFAULT: '#8B5CF6',
          50:  '#FAF7FF',
          100: '#EDE9FE',
          200: '#DDD6FE',
          300: '#C4B5FD',
          400: '#A78BFA',
          500: '#8B5CF6',
          600: '#7C3AED',
          700: '#6D28D9',
        },
        surface: {
          DEFAULT: '#FAF7FF',
          dark: '#030712',
        },
        lavender: {
          bg: '#FAF7FF',
          section: '#F5F3FF',
          border: '#E9D5FF',
          highlight: '#EDE9FE',
          primary: '#C4B5FD',
          secondary: '#DDD6FE',
          accent: '#8B5CF6',
          'text-primary': '#312E81',
          'text-secondary': '#6B7280',
        },
        dark: {
          bg:      '#030712',
          card:    '#0b1528',
          border:  '#1e293b',
          text:    '#f8fafc',
          muted:   '#94a3b8',
        },
      },
      fontFamily: {
        sans:    ['Inter', 'system-ui', 'sans-serif'],
        display: ['Poppins', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        '2xs': ['0.625rem', { lineHeight: '1rem' }],
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
        '4xl': '2rem',
      },
      boxShadow: {
        card:    '0 2px 15px -3px rgba(0,0,0,.07), 0 10px 20px -2px rgba(0,0,0,.04)',
        'card-hover': '0 10px 40px -10px rgba(99,102,241,.35)',
        glow:    '0 0 30px rgba(99,102,241,.4)',
        'glow-accent': '0 0 30px rgba(236,72,153,.35)',
      },
      backgroundImage: {
        'hero-gradient':   'linear-gradient(135deg, #4f46e5 0%, #6366f1 50%, #06b6d4 100%)',
        'card-gradient':   'linear-gradient(135deg, rgba(99,102,241,.08) 0%, rgba(6,182,212,.08) 100%)',
        'dark-gradient':   'linear-gradient(135deg, #030712 0%, #0b1528 100%)',
        'accent-gradient': 'linear-gradient(135deg, #ec4899 0%, #f43f5e 100%)',
      },
      animation: {
        'fade-in':     'fadeIn .5s ease-in-out',
        'slide-up':    'slideUp .4s ease-out',
        'slide-down':  'slideDown .4s ease-out',
        'scale-in':    'scaleIn .3s ease-out',
        'pulse-slow':  'pulse 3s cubic-bezier(.4,0,.6,1) infinite',
        'shimmer':     'shimmer 2s infinite',
        'float':       'float 3s ease-in-out infinite',
        'spin-slow':   'spin 8s linear infinite',
      },
      keyframes: {
        fadeIn:   { '0%': { opacity: 0 },             '100%': { opacity: 1 } },
        slideUp:  { '0%': { transform: 'translateY(20px)', opacity: 0 }, '100%': { transform: 'translateY(0)', opacity: 1 } },
        slideDown:{ '0%': { transform: 'translateY(-20px)', opacity: 0 }, '100%': { transform: 'translateY(0)', opacity: 1 } },
        scaleIn:  { '0%': { transform: 'scale(.95)', opacity: 0 }, '100%': { transform: 'scale(1)', opacity: 1 } },
        shimmer:  { '0%': { backgroundPosition: '-200% 0' }, '100%': { backgroundPosition: '200% 0' } },
        float:    { '0%,100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-10px)' } },
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
}
