/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Primary Brand
        brand: {
          50:  '#eef6ff',
          100: '#d9ecff',
          200: '#bcdcfe',
          300: '#8ec6fd',
          400: '#59a6fa',
          500: '#3383f6',
          600: '#1a62eb',
          700: '#1a4fd8',
          800: '#1c42af',
          900: '#1d3c8a',
          950: '#162554',
        },
        // Slate Gray
        slate: {
          50:  '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
          950: '#020617',
        },
        // Emerald for success/positive states
        emerald: {
          50:  '#ecfdf5',
          100: '#d1fae5',
          200: '#a7f3d0',
          300: '#6ee7b7',
          400: '#34d399',
          500: '#10b981',
          600: '#059669',
          700: '#047857',
          800: '#065f46',
          900: '#064e3b',
          950: '#022c22',
        },
        // Deep Blue for backgrounds
        deep: {
          900: '#060d1f',
          800: '#0a1628',
          700: '#0f1f3d',
          600: '#142552',
        },
      },
      fontFamily: {
        display: ['"Space Grotesk"', 'system-ui', 'sans-serif'],
        body: ['"DM Sans"', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', '"Fira Code"', 'monospace'],
        arabic: ['"Cairo"', '"Tajawal"', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'mesh-dark': 'radial-gradient(at 40% 20%, hsla(220,80%,20%,1) 0px, transparent 50%), radial-gradient(at 80% 0%, hsla(189,80%,15%,1) 0px, transparent 50%), radial-gradient(at 0% 50%, hsla(240,80%,12%,1) 0px, transparent 50%)',
        'mesh-light': 'radial-gradient(at 40% 20%, hsla(220,80%,95%,1) 0px, transparent 50%), radial-gradient(at 80% 0%, hsla(189,80%,92%,1) 0px, transparent 50%), radial-gradient(at 0% 50%, hsla(240,80%,97%,1) 0px, transparent 50%)',
      },
      boxShadow: {
        'glow-blue': '0 0 30px rgba(51,131,246,0.3)',
        'glow-emerald': '0 0 30px rgba(16,185,129,0.3)',
        'glass': '0 8px 32px rgba(0,0,0,0.2)',
        'card-dark': '0 4px 24px rgba(0,0,0,0.4)',
        'card-light': '0 4px 24px rgba(0,0,0,0.08)',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease forwards',
        'slide-up': 'slideUp 0.5s ease forwards',
        'pulse-slow': 'pulse 3s ease-in-out infinite',
        'float': 'float 6s ease-in-out infinite',
        'shimmer': 'shimmer 2s linear infinite',
      },
      keyframes: {
        fadeIn: {
          from: { opacity: '0' },
          to:   { opacity: '1' },
        },
        slideUp: {
          from: { opacity: '0', transform: 'translateY(20px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%':       { transform: 'translateY(-10px)' },
        },
        shimmer: {
          from: { backgroundPosition: '-200% 0' },
          to:   { backgroundPosition: '200% 0' },
        },
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
};
