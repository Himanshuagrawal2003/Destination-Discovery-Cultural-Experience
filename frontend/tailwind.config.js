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
          50:  '#eef2ff',
          100: '#e0e7ff',
          200: '#c7d2fe',
          300: '#a5b4fc',
          400: '#818cf8',
          500: '#6366f1',
          600: '#4f46e5',
          700: '#4338ca',
          800: '#3730a3',
          900: '#312e81',
          950: '#1e1b4b',
        },
        secondary: {
          DEFAULT: '#06b6d4', // Vibrant Cyan
        },
        accent: {
          DEFAULT: '#ec4899', // Rich Rose
          50:  '#fdf2f8',
          100: '#fce7f3',
          400: '#f472b6',
          500: '#ec4899',
          600: '#db2777',
        },
        surface: {
          DEFAULT: '#F8FAFC',
          dark: '#030712', // Deep Obsidian
        },
        dark: {
          bg:      '#030712', // Obsidian black
          card:    '#0b1528', // Premium deep navy card
          border:  '#1e293b', // Dark border
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
