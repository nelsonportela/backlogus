/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{vue,js,jsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        primary: {
          50: "#f0f9ff",
          500: "#3b82f6",
          600: "#2563eb",
          700: "#1d4ed8",
        },
      },
      height: {
        "screen-dynamic": ["100vh", "100dvh", "calc(var(--vh, 1vh) * 100)"],
        "screen-real": "calc(var(--real-vh, 1vh) * 100)",
        "screen-ios": "calc(var(--vh, 1vh) * 100)",
      },
      minHeight: {
        "screen-dynamic": ["100vh", "100dvh", "calc(var(--vh, 1vh) * 100)"],
        "screen-real": "calc(var(--real-vh, 1vh) * 100)",
        "screen-ios": "calc(var(--vh, 1vh) * 100)",
      },
      padding: {
        "safe-top": "env(safe-area-inset-top)",
        "safe-bottom": "env(safe-area-inset-bottom)",
        "safe-left": "env(safe-area-inset-left)",
        "safe-right": "env(safe-area-inset-right)",
      },
      margin: {
        "safe-top": "env(safe-area-inset-top)",
        "safe-bottom": "env(safe-area-inset-bottom)",
        "safe-left": "env(safe-area-inset-left)",
        "safe-right": "env(safe-area-inset-right)",
      },
    },
  },
  plugins: [],
};
