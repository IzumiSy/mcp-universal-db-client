import { defineConfig } from "tsdown";

export default defineConfig({
  entry: "./src/index.ts",
  ...(process.env.NODE_ENV === "production"
    ? { minify: true }
    : { sourcemap: true }),
});
