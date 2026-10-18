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
        navy: {
          950: '#0B1020', // Main dark navy background
          900: '#11182A', // Sidebar and base elevated panel
          850: '#151B2E', // Elevated cards / modals
          800: '#1E2640', // Hover states and borders
          700: '#283354', // Border highlighting
          600: '#3D4B75',
        },
        accent: {
          purple: '#7C5CFC', // Primary accent
          purpleHover: '#6948EC',
          blue: '#4F8CFF',   // Secondary accent
          blueHover: '#3878F5',
        },
        status: {
          success: '#20D6A0', // Positive indicators
          danger: '#FF647C',  // Negative indicators
          warning: '#F5B942', // Warning indicators
          info: '#4F8CFF',
        },
        text: {
          primary: '#F3F5FF',
          secondary: '#929CB5',
          muted: '#616E8E',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
