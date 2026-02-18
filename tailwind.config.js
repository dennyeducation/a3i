/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./app/**/*.{js,ts,jsx,tsx,mdx}",
        "./components/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    darkMode: "class",
    theme: {
        extend: {
            colors: {
                "primary": "#f2b90d",
                "background-light": "#f8f8f5",
                "background-dark": "#0F0F0F",
                "surface-dark": "#161616",
                "neutral-gold": "#3d361c",
                "deep-black": "#000000",
                "neutral-dark": "#151515",
                "neutral-muted": "#1e1e1e",
            },
            fontFamily: {
                "display": ["Public Sans", "sans-serif"]
            },
            borderRadius: {
                "DEFAULT": "0.25rem",
                "lg": "0.5rem",
                "xl": "0.75rem",
                "full": "9999px"
            },
        },
    },
    plugins: [],
}
