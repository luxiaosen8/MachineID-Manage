import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import { resolve } from "path";

// https://vitejs.dev/config/
export default defineConfig(async () => ({
  plugins: [vue()],

  // Vite options tailored for Tauri development and only applied in `tauri dev` or `tauri build`
  //
  // 1. prevent vite from obscuring rust errors
  clearScreen: false,
  // 2. tauri expects a fixed port, fail if that port is not available
  server: {
    port: 1420,
    strictPort: true,
    watch: {
      // 3. tell vite to ignore watching `src-tauri`
      ignored: ["**/src-tauri/**"],
    },
  },
  // to access the Tauri environment variables set by the CLI with information about the current target
  envPrefix: ["VITE_", "TAURI_"],
  build: {
    // Tauri supports es2021
    target: process.env.TAURI_PLATFORM == "windows" ? "chrome105" : "safari13",
    // don't minify for debug builds
    minify: !process.env.TAURI_DEBUG ? "esbuild" : false,
    // produce sourcemaps for debug builds
    sourcemap: !!process.env.TAURI_DEBUG,
    outDir: "dist",
  },
  resolve: {
    alias: {
      "@": resolve(__dirname, "src"),
      "@components": resolve(__dirname, "src/components"),
      "@views": resolve(__dirname, "src/views"),
      "@stores": resolve(__dirname, "src/stores"),
      "@utils": resolve(__dirname, "src/utils"),
      "@types": resolve(__dirname, "src/types"),
      "@assets": resolve(__dirname, "src/assets"),
      // DDD 架构路径别名
      "@domains": resolve(__dirname, "src/domains"),
      "@application": resolve(__dirname, "src/application"),
      "@infrastructure": resolve(__dirname, "src/infrastructure"),
      "@presentation": resolve(__dirname, "src/presentation"),
      // 测试路径别名
      "@tests": resolve(__dirname, "tests"),
    },
  },
}));
