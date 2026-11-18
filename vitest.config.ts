import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

export default defineConfig({
  cacheDir: ".cache/vite",
  resolve: { alias: {
    "@": fileURLToPath(new URL("./src", import.meta.url)),
    "server-only": fileURLToPath(new URL("./node_modules/next/dist/compiled/server-only/empty.js", import.meta.url)),
  } },
  test: { environment: "node", include: ["src/**/*.test.ts"], fsModuleCachePath: ".cache/vitest", setupFiles: ["./src/test/setup.ts"] },
});
