import { defineConfig } from "vite";
import { svelte } from "@sveltejs/vite-plugin-svelte";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [svelte()],
  // assetsInclude: ["./embed/meridian.html", "src/embed/meridian.min.js"],
});
