/** @type {import('postcss-load-config').Config} */
const config = {
  plugins: {
    '@tailwindcss/postcss': {}, // 👈 ここが変わりました！
    autoprefixer: {},
  },
};

export default config;
