/** @type {import('tailwindcss').Config} */

// 全站统一宋体：
// 英文用衬线体（EB Garamond / Noto Serif），中文用思源宋体（Noto Serif SC）。
// sans / mono 也一并指向宋体栈，避免任何地方漏出无衬线或等宽字体。
const SERIF = [
  '"Noto Serif"',
  '"Noto Serif SC"',
  '"Songti SC"',
  "STSong",
  "SimSun",
  "Georgia",
  "serif",
];
const DISPLAY = [
  '"EB Garamond"',
  '"Noto Serif SC"',
  '"Songti SC"',
  "STSong",
  "SimSun",
  "Georgia",
  "serif",
];

export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        serif: SERIF,
        display: DISPLAY,
        sans: SERIF,
        mono: SERIF,
      },
      colors: {
        ink: {
          DEFAULT: "#141310",
          light: "#2a2825",
          muted: "#8b8880",
        },
        paper: {
          DEFAULT: "#ffffff",
          warm: "#fbfaf8",
          cream: "#f5f3ee",
        },
        // 日式辅助色（仅用于极小的装饰细节）
        shu: "#b04630", // 朱
        ai: "#33556e", // 藍
        wakatake: "#7d9174", // 若竹
        fuji: "#8b81c3", // 藤
        sumi: "#141310", // 墨
      },
      letterSpacing: {
        tightest: "-0.05em",
        wider: "0.15em",
        widest: "0.3em",
      },
      transitionTimingFunction: {
        silk: "cubic-bezier(0.22, 1, 0.36, 1)",
      },
      animation: {
        "fade-in": "fadeIn 1.2s ease-out forwards",
        "fade-up": "fadeUp 1s ease-out forwards",
        "marquee-left": "marqueeLeft 42s linear infinite",
        "marquee-right": "marqueeRight 42s linear infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        fadeUp: {
          "0%": { opacity: "0", transform: "translateY(40px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        marqueeLeft: {
          "0%": { transform: "translate3d(0,0,0)" },
          "100%": { transform: "translate3d(-50%,0,0)" },
        },
        marqueeRight: {
          "0%": { transform: "translate3d(-50%,0,0)" },
          "100%": { transform: "translate3d(0,0,0)" },
        },
      },
    },
  },
  plugins: [],
};
