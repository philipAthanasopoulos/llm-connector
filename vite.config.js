import react from "@vitejs/plugin-react";
import path from "path";
import eslint from "vite-plugin-eslint2";

import { defineConfig  } from "vite";

export default ({ mode }) => {
  
  return defineConfig({
    root: "src",
    publicDir: mode === 'development' ? '../public' : false,
    server: {
      headers: {
        'Cross-Origin-Opener-Policy': 'same-origin',
        'Cross-Origin-Embedder-Policy': 'require-corp',
      },
    },
    preview: {
      headers: {
        'Cross-Origin-Opener-Policy': 'same-origin',
        'Cross-Origin-Embedder-Policy': 'require-corp',
      },
    },
    build: {
      lib: {
        entry: path.resolve(__dirname, "src/index.tsx"),
        name: "rcb-plugin",
        fileName: "index",
        formats: ["es", "cjs"],
      },
      rollupOptions: {
        external: [
          "react",
          "react-dom",
          "react-dom/server",
          "react/jsx-runtime",
          "react/jsx-dev-runtime",
          "react-chatbotify",
          "@mlc-ai/web-llm",
        ],
        output: {
          globals: {
            react: "React",
          }
        },
      },
      outDir: "../dist",
      assetsInclude: ['**/*.wasm'],
    },
    plugins: [
      react({
        include: "**/*.{jsx,tsx}",
      }),
      eslint()
    ],
  });
}