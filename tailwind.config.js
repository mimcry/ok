/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './App.{js,jsx,ts,tsx}',
    './app/**/*.{js,jsx,ts,tsx}',
  ],
  presets: [ require('nativewind/preset') ],
  theme: {
    extend: {colors:{
      primary:"#395ACE",
      secondary:"#EDEFFF",
      icon:"#395ACE",
       neatlygreen: "#4D9043"
    }},
  },
  plugins: [],
};
