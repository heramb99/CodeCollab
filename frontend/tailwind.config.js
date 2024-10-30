/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: {
          DEFAULT: 'hsl(249, 100%, 3.9%)',
        },
        foreground: {
          DEFAULT: 'hsl(248, 100%, 88%)',
        },
        card: {
          DEFAULT: 'hsl(224, 71.4%, 4.1%)',
          foreground: 'hsl(210, 20%, 98%)',
        },
        popover: {
          DEFAULT: 'hsl(224, 71.4%, 4.1%)',
          foreground: 'hsl(210, 20%, 98%)',
        },
        primary: {
          DEFAULT: 'hsl(266, 100%, 50%)',
          foreground: 'hsl(210, 20%, 98%)',
        },
        secondary: {
          DEFAULT: 'hsl(215, 27.9%, 16.9%)',
          foreground: 'hsl(210, 20%, 98%)',
        },
        muted: {
          DEFAULT: 'hsl(215, 27.9%, 16.9%)',
          foreground: 'hsl(217.9, 10.6%, 30.9%)',
        },
        accent: {
          DEFAULT: 'hsl(215, 27.9%, 16.9%)',
          foreground: 'hsl(210, 20%, 98%)',
        },
        destructive: {
          DEFAULT: 'hsl(0, 62.8%, 30.6%)',
          foreground: 'hsl(210, 20%, 98%)',
        },
        border: {
          DEFAULT: 'hsl(247, 18.3%, 18.2%)',
        },
        input: {
          DEFAULT: 'hsl(215, 27.9%, 16.9%)',
        },
        ring: {
          DEFAULT: 'hsl(263.4, 70%, 50.4%)',
        },
        washedPurple:'rgb(129 126 181',
        primaryBlue:'#0469ff',
        primaryPurple:'#7000ff'
      },
    },
  },
  plugins: [],
}