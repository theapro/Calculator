/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      keyframes: {
        slideIn: {
          '0%': { transform: 'translateX(-100%)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
      },
      animation: {
        slideIn: 'slideIn 1s ease-out',
      },
      backgroundImage: {
        myimage: "url('./src/assets/aynback1.jpg')"
      },
      boxShadow: {
        custom: '0px 0px 17px 0px rgba(96, 0, 240, 1)',
      },
      colors: {
        primary: "#000000",
        navi: "#05060a",
        secondary: "ffa448",
        dark: "#1e1e1e",
        light: "f5f5f5",
        codee: "#39fc03",
        glass: "#a8ccd7",
      },
    },
    fontFamily: {
      poppins: ["Poppins", "sans-serif"],
      anton: ["Anton", "sans-serif"],
      orbitron: ["Orbitron", "serif"],
      aoboshi: ["Aoboshi One", "serif"],
      zen: ["Zen Antique", "serif"],
      kagaku: ["Kagaku", "serif"],
      verbatim: ["Verbatim", "serif"],
    },
    container: {
      center: true,
      padding: {
        DEFAULT: "1rem",
        sm: "2rem",
        lg: "4rem",
        xl: "5rem",
        "2xl": "6rem",
      },
    },
  },
  plugins: [],
};
