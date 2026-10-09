// Tailwind CSS v4 uses its own PostCSS plugin package (not `tailwindcss` itself).
// package.json has "type": "module", so this file is ESM.
const config = {
  plugins: {
    "@tailwindcss/postcss": {},
  },
};

export default config;
