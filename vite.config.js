import { defineConfig } from "vite";
import { resolve } from "node:path";
export default defineConfig({
  base: "/motion-studies/",
  build: {
    rollupOptions: {
      input: Object.fromEntries(
        [
          "index",
          "prism/index",
          "aurora/index",
          "tactile/index",
          "depth/index",
        ].map((path) => [path, resolve(import.meta.dirname, path + ".html")]),
      ),
    },
  },
});
