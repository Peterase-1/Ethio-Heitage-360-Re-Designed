/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: 'var(--background)',
        foreground: 'var(--foreground)',
        card: {
          DEFAULT: 'var(--card)',
          foreground: 'var(--card-foreground)',
        },
        popover: {
          DEFAULT: 'var(--popover)',
          foreground: 'var(--popover-foreground)',
        },
        primary: {
          DEFAULT: 'var(--primary)',
          foreground: 'var(--primary-foreground)',
        },
        secondary: {
          DEFAULT: 'var(--secondary)',
          foreground: 'var(--secondary-foreground)',
        },
        muted: {
          DEFAULT: 'var(--muted)',
          foreground: 'var(--muted-foreground)',
        },
        accent: {
          DEFAULT: 'var(--accent)',
          foreground: 'var(--accent-foreground)',
        },
        destructive: {
          DEFAULT: 'var(--destructive)',
          foreground: 'var(--destructive-foreground)',
        },
        border: 'var(--border)',
        input: 'var(--input)',
        ring: 'var(--ring)',
        // Educational Enhancement Colors
        'edu-primary': 'var(--educational-primary)',
        'edu-secondary': 'var(--educational-secondary)',
        'edu-accent': 'var(--educational-accent)',
        'edu-success': 'var(--educational-success)',
        'edu-warning': 'var(--educational-warning)',
        'edu-info': 'var(--educational-info)',
        'edu-progress': 'var(--educational-progress)',
        'edu-course-bg': 'var(--educational-course-bg)',
        'edu-course-border': 'var(--educational-course-border)',
        'edu-hover': 'var(--educational-hover)',
      },
      borderColor: {
        DEFAULT: 'var(--border)',
        border: 'var(--border)',
      },
      outlineColor: {
        ring: 'var(--ring)',
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
    },
  },
  plugins: [],
}
