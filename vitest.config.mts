import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

const r = (p: string) => fileURLToPath(new URL(p, import.meta.url));

export default defineConfig({
  test: { include: ["tests/**/*.test.ts"], environment: "node" },
  resolve: { alias: { "@": r("./"), "server-only": r("./tests/server-only-stub.ts") } },
});
