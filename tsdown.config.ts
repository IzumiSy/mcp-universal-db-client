import { defineConfig, UserConfig } from "tsdown";

const opts: UserConfig =
  process.env.NODE_ENV === "production"
    ? { minify: true }
    : { sourcemap: true };

export default defineConfig({
  entry: ["./src/index.ts"],
  ...opts,
});
