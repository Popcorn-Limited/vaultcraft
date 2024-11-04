/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/*.{ts,tsx}",
    "./pages/**/*.{ts,tsx}",
    "./stories/**/*.{ts,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./containers/**/*.{js,ts,jsx,tsx}",
    "../app/pages/**/*.{js,ts,jsx,tsx}",
    "../app/components/**/*.{js,ts,jsx,tsx}",
    "../components/components/**/*.{js,ts,jsx,tsx}",
  ],

  theme: {
    container: {
      padding: "2rem",
      center: true,
      screens: {
        lglaptop: "1366px",
      },
    },
    screens: {
      xs: "400px",
      // => @media (min-"440px) { ... }

      sm: "640px",
      // => @media (min-"640px) { ... }

      smmd: "700px",

      md: "1024px",
      // => @media (min-"1024px) { ... }

      lg: "1200px",
      // => @media (min-"1440px) { ... }

      laptop: "1440px",
      // => @media (min-"1440px) { ... }

      lglaptop: "1680px",
      // => @media (min-"1440px) { ... }

      xl: "1920px",
      // => @media (min-"1920px) { ... }

      "2xl": "2560px",
      // => @media (min-"2560px) { ... }
    },
    extend: {
      animation: {
        "spin-slow": "spin 2.5s linear infinite",
      },
      borderRadius: {
        "4xl": "2rem",
        "5xl": "2.5rem",
        "6xl": "3rem",
      },
      zIndex: {
        60: "60",
        70: "70",
        80: "80",
        90: "90",
        100: "100",
      },
      spacing: {
        18: "4.5rem",
        72: "18rem",
        76: "19rem",
        84: "21rem",
        88: "22rem",
        92: "23rem",
        96: "24rem",
        100: "25rem",
        104: "27rem",
        108: "28rem",
        110: "29.5rem",
        112: "30rem",
        114: "30.5rem",
        116: "31rem",
        120: "32rem",
        124: "33rem",
        128: "34rem",
        132: "38rem",
        136: "42rem",
        138: "44rem",
        142: "47rem",
        150: "53rem",
        156: "61rem",
        160: "65rem",
        200: "70rem",
        384: "102rem",
        386: "110rem",
      },
      colors: {
        customNeutral100: "#353945",
        customNeutral200: "#23262F",
        customNeutral300: "#141416",

        customGray100: "#D7D7D7",
        customGray200: "#C8C8C8",
        customGray300: "#AFAFAF",
        customGray400: "#969696",
        customGray500: "#737373",
        customGray600: "#555555",

        primaryGreen: "#7AFB79",
        primaryYellow: "#DFFF1C",
        secondaryYellow: "#FFE650",
        secondaryBlue: "#87C1F8",
        secondaryPink: "#E93BD5",
        secondaryFuchsia: "#F289E6",
        secondaryPurple: "#9B55FF",
        secondaryViolet: "#C391FF",
      },
      fontSize: {
        zero: "0rem",
        xs: ".75rem",
        sm: ".875rem",
        tiny: ".875rem",
        base: "1rem",
        lg: "1.125rem",
        xl: "1.25rem",
        "2xl": "1.5rem",
        "3xl": "2rem",
        "4xl": "2.5rem",
        "5xl": "3rem",
        "6xl": "3.5rem",
        "7xl": "4rem",
        "8xl": "4.5rem",
        "9xl": "6rem",
        "10xl": "8rem",
      },
      fontFamily: {
        khTeka: ["'KH Teka'", "sans-serif"],
      },
      letterSpacing: {
        1: "1px",
      },
    },
  },
  plugins: [require("tailwind-scrollbar-hide")],
};
