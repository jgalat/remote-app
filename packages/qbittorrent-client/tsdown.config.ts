import { defineConfig } from "tsdown";

export default defineConfig({
  entry: ["src/index.ts", "src/schemas.ts"],
  format: ["esm", "cjs"],
  dts: true,
  outputOptions(options, format) {
    if (format !== "cjs") return options;
    return { ...options, exports: "named" };
  },
});
