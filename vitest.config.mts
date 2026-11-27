import { fileURLToPath } from "node:url";

// Plain config object (no vitest import) so `pnpm test` works via dlx without a local install.
const r = (p: string) => fileURLToPath(new URL(p, import.meta.url));

const config = {
  test: { include: ["tests/**/*.test.ts"], environment: "node" },
  resolve: { alias: { "@": r("./"), "server-only": r("./tests/server-only-stub.ts") } },
};

export default config;
