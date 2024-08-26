
import { defineConfig } from 'vite';

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    open: true,
    port: 5176,
    origin: 'http://localhost:5176',
  },
  preview: {
    port: 5176,
  },
  base: 'http://localhost:5176',
  resolve: {
    alias: {
      react: "./src/mockModules/loadReact.js",
      "react-dom": "./src/mockModules/loadReactDom.js",
      localReact: "react",
      localReactDom: "react-dom",
    }
  },
  build: {
    target: 'chrome89',
    rollupOptions: {
      output: {
        chunkFileNames: "[name][hash].js",
        manualChunks(id) {
          if (id.includes("loadReactDom")) return "loadReactDom"
          if (id.includes("loadReact")) return "loadReact"
          if (id.includes("hostAutoInit")) {
            return "hostAutoInit"
          }
          if (id.includes("remoteEntry")) {
            return "remoteEntry"
          }
        }
      }
    }
  },
});
