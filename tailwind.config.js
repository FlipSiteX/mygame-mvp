export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      backgroundImage: {
        'background-img': "url('/public/background.jpg')",
      }
    }
  },
  plugins: [],
}