export default {
  darkMode: ['class', '[data-theme="dark"]'],
  content: ['./popup.html', './sidepanel.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        navy: { 900: '#0b1b33', 800: '#10264a', 700: '#173560' },
        teal: { 500: '#14b8a6', 600: '#0d9488' },
      },
      fontFamily: { sans: ['Inter', 'system-ui', 'Segoe UI', 'sans-serif'], mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'] },
    },
  },
};
