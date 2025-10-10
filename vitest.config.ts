import { defineConfig } from "vitest/config";
import path from "node:path";

export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
      "@core": path.resolve(__dirname, "packages/core"),
      "@llm": path.resolve(__dirname, "packages/llm"),
    },
  },
  test: {
    environment: "node",
    globals: true,
    coverage: {
      provider: "v8",
      reportsDirectory: "coverage",
    },
  },
});
