/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        chat: {
          dark: '#0f172a',
          sidebar: '#1e293b',
          bubbleSelf: '#2563eb',
          bubbleOther: '#334155',
          accent: '#3b82f6'
        }
      }
    },
  },
  plugins: [],
}
