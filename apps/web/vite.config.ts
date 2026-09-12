import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  server: { port: 5173 },
  // One .env file for the whole monorepo (see apps/api/src/env.ts, which
  // reads from the same root) rather than a separate apps/web/.env to keep in sync.
  envDir: path.resolve(__dirname, "../..")
});
