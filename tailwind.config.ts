import type { Config } from "tailwindcss";

export default {
    content: [
        "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    darkMode: 'class',
    theme: {
        extend: {
            colors: {
                // 温暖友好的主色调
                primary: {
                    50: '#fff5f5',
                    100: '#ffe3e3',
                    200: '#ffc9c9',
                    300: '#ffa8a8',
                    400: '#ff8787',
                    500: '#ff6b6b',
                    600: '#fa5252',
                    700: '#f03e3e',
                    800: '#e03131',
                    900: '#c92a2a',
                },
                // 阳光黄色辅助色
                accent: {
                    50: '#fffbeb',
                    100: '#fff3c4',
                    200: '#ffe66d',
                    300: '#ffd93d',
                    400: '#ffc107',
                    500: '#f59f00',
                    600: '#d48806',
                    700: '#a66908',
                    800: '#7d4e0a',
                    900: '#5c3d0d',
                },
                // 青绿色点缀
                teal: {
                    50: '#e6fcf5',
                    100: '#c3fae8',
                    200: '#96f2d7',
                    300: '#63e6be',
                    400: '#4ecdc4',
                    500: '#38d9a9',
                    600: '#20c997',
                    700: '#12b886',
                    800: '#0ca678',
                    900: '#099268',
                },
            },
            fontFamily: {
                sans: ['Inter', 'system-ui', 'sans-serif'],
            },
            animation: {
                'fade-in': 'fadeIn 0.5s ease-out',
                'slide-up': 'slideUp 0.5s ease-out',
                'bounce-subtle': 'bounceSubtle 2s infinite',
                'pulse-slow': 'pulse 3s infinite',
            },
            keyframes: {
                fadeIn: {
                    '0%': { opacity: '0' },
                    '100%': { opacity: '1' },
                },
                slideUp: {
                    '0%': { opacity: '0', transform: 'translateY(20px)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' },
                },
                bounceSubtle: {
                    '0%, 100%': { transform: 'translateY(0)' },
                    '50%': { transform: 'translateY(-5px)' },
                },
            },
            backgroundImage: {
                'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
                'hero-pattern': 'linear-gradient(135deg, #ff6b6b 0%, #ffc107 100%)',
            },
        },
    },
    plugins: [],
} satisfies Config;
