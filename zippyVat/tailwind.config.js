/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./App.{js,jsx,ts,tsx}", "./screens/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        brand: {
          brown: "#85431E",
          orange: "#DA7347",
          beige: "#F2EBD9",
          black: "#111111",
          blue: "#526FAE",
          navy: "#1C2245",
        }
      },
      fontFamily: {
        display: ["GTUltra-Bold"],
        "display-reg": ["GTUltra-Regular"],
        "display-light": ["GTUltra-Light"],
        body: ["GTUltraFine-Regular"],
        "body-bold": ["GTUltraFine-Bold"],
        "body-light": ["GTUltraFine-Light"],
      }
    },
  },

  plugins: [],
}

