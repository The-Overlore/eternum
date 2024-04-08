import { defineConfig } from "vite";
import { resolve } from "path";
import react from "@vitejs/plugin-react";

import wasm from "vite-plugin-wasm";
import topLevelAwait from "vite-plugin-top-level-await";
import svgr from "@svgr/rollup";
import path from "path";
// https://vitejs.dev/config/
export default defineConfig({
  plugins: [svgr({ dimensions: false, svgo: false, typescript: true }), react(), wasm(), topLevelAwait()],
  resolve: {
    alias: {
      events: "events",
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    target: "esnext",
    rollupOptions: {
      input: {
        main: resolve(__dirname, "index.html"),
        map: resolve(__dirname, "index.html"),
        realm: resolve(__dirname, "index.html"),
      },
      maxParallelFileOps: 2,
      cache: false,
      // external: ["react", "react-dom"],
      output: {
        globals: {
          react: "React",
          "react-dom": "ReactDOM",
        },
        sourcemap: true,
        manualChunks: (id) => {
          if (id.includes("node_modules")) {
            return "vendor";
          }
        },
        inlineDynamicImports: false,
        sourcemapIgnoreList: (relativeSourcePath) => {
          const normalizedPath = path.normalize(relativeSourcePath);
          return normalizedPath.includes("node_modules");
        },
      },
    },
  },
  optimizeDeps: {
    exclude: ["js-big-decimal"],
  },
});
