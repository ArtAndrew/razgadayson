/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: ['class', '[data-theme="dark"]'],
  theme: {
    extend: {
      colors: {
        // Brand Colors
        primary: {
          50: 'var(--primary-50)',
          100: 'var(--primary-100)',
          200: 'var(--primary-200)',
          300: 'var(--primary-300)',
          400: 'var(--primary-400)',
          500: 'var(--primary-500)',
          600: 'var(--primary-600)',
          700: 'var(--primary-700)',
          800: 'var(--primary-800)',
          900: 'var(--primary-900)',
        },
        secondary: {
          50: 'var(--secondary-50)',
          100: 'var(--secondary-100)',
          200: 'var(--secondary-200)',
          300: 'var(--secondary-300)',
          400: 'var(--secondary-400)',
          500: 'var(--secondary-500)',
          600: 'var(--secondary-600)',
          700: 'var(--secondary-700)',
          800: 'var(--secondary-800)',
          900: 'var(--secondary-900)',
        },
        // Accent Colors
        accent: {
          cyan: 'var(--accent-cyan)',
          emerald: 'var(--accent-emerald)',
          pink: 'var(--accent-pink)',
          orange: 'var(--accent-orange)',
        },
        // Semantic Colors
        bg: {
          primary: 'var(--bg-primary)',
          secondary: 'var(--bg-secondary)',
          tertiary: 'var(--bg-tertiary)',
          card: 'var(--bg-card)',
          overlay: 'var(--bg-overlay)',
        },
        text: {
          primary: 'var(--text-primary)',
          secondary: 'var(--text-secondary)',
          muted: 'var(--text-muted)',
        },
        border: {
          light: 'var(--border-light)',
          medium: 'var(--border-medium)',
          strong: 'var(--border-strong)',
        },
        glass: {
          light: 'var(--glass-light)',
          medium: 'var(--glass-medium)',
          strong: 'var(--glass-strong)',
        }
      },
      fontFamily: {
        'sans': 'var(--font-sans)',
        'display': 'var(--font-display)',
      },
      fontSize: {
        'hero': 'clamp(2.5rem, 8vw, 8rem)',
        'display': 'clamp(2rem, 5vw, 4rem)',
        'title': 'clamp(1.5rem, 3vw, 2.5rem)',
      },
      spacing: {
        'xs': 'var(--spacing-xs)',
        'sm': 'var(--spacing-sm)',
        'md': 'var(--spacing-md)',
        'lg': 'var(--spacing-lg)',
        'xl': 'var(--spacing-xl)',
        '2xl': 'var(--spacing-2xl)',
      },
      borderRadius: {
        'sm': 'var(--radius-sm)',
        'md': 'var(--radius-md)',
        'lg': 'var(--radius-lg)',
        'xl': 'var(--radius-xl)',
        '2xl': 'var(--radius-2xl)',
        '3xl': 'var(--radius-3xl)',
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'float-gentle': 'float-gentle 20s ease-in-out infinite',
        'pulse-gentle': 'pulse-gentle 3s ease-in-out infinite',
        'scale-in': 'scale-in 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        'slide-up': 'slide-up 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
        'fade-in': 'fade-in 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        'float-gentle': {
          '0%, 100%': { 
            opacity: '0.05',
            transform: 'scale(1) rotate(0deg)'
          },
          '33%': { 
            opacity: '0.08',
            transform: 'scale(1.1) rotate(1deg)'
          },
          '66%': { 
            opacity: '0.03',
            transform: 'scale(0.9) rotate(-1deg)'
          },
        },
        'pulse-gentle': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.8' },
        },
        'scale-in': {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        'slide-up': {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
      boxShadow: {
        'sm': 'var(--shadow-sm)',
        'md': 'var(--shadow-md)',
        'lg': 'var(--shadow-lg)',
        'xl': 'var(--shadow-xl)',
        'glow-primary': '0 0 30px rgba(169, 112, 255, 0.3)',
        'glow-cyan': '0 0 30px rgba(6, 182, 212, 0.3)',
        'glow-pink': '0 0 30px rgba(236, 72, 153, 0.3)',
        'glow-emerald': '0 0 30px rgba(16, 185, 129, 0.3)',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-primary': 'var(--gradient-primary)',
        'gradient-secondary': 'var(--gradient-secondary)',
        'gradient-tertiary': 'var(--gradient-tertiary)',
        'mesh-gradient': `
          radial-gradient(circle at 20% 20%, var(--primary-500) 0%, transparent 50%),
          radial-gradient(circle at 80% 80%, var(--accent-cyan) 0%, transparent 50%),
          radial-gradient(circle at 40% 80%, var(--accent-pink) 0%, transparent 50%)
        `,
      },
      transitionTimingFunction: {
        'smooth': 'var(--animation-smooth)',
        'bounce': 'var(--animation-bounce)',
      },
      backdropBlur: {
        'xs': '2px',
        'sm': '4px',
        'md': '12px',
        'lg': '16px',
        'xl': '20px',
        '2xl': '24px',
      },
    },
  },
  plugins: [
    function({ addUtilities }) {
      addUtilities({
        '.text-balance': {
          'text-wrap': 'balance',
        },
        '.transition-smooth': {
          'transition': 'all 0.3s var(--animation-smooth)',
        },
        '.hover-lift': {
          '&:hover': {
            'transform': 'translateY(-4px)',
            'transition': 'transform 0.2s var(--animation-smooth)',
          },
        },
        '.focus-ring': {
          '&:focus-visible': {
            'outline': '2px solid var(--primary-500)',
            'outline-offset': '2px',
            'border-radius': 'var(--radius-md)',
          },
        },
      })
    }
  ],
}