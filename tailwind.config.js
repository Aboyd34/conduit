export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        bg:     "#07060f",
        panel:  "#0f0e1f",
        panel2: "#13122a",
        accent: "#7a5cff",
        signal: "#00ff9f",
        cyan:   "#00d4ff"
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        mono: ["Space Grotesk", "monospace"]
      }
    }
  },
  plugins: []
};
