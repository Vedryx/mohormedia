import { defineConfig } from "@playwright/test";
import { randomUUID } from "node:crypto";
const db =
  process.env.MOHOR_TEST_DB || `mohor_e2e_${randomUUID().replaceAll("-", "")}`;
process.env.MOHOR_TEST_DB = db;
export default defineConfig({
  expect: { timeout: 15000 },
  testDir: "./tests",
  testMatch: "**/*.spec.js",
  fullyParallel: false,
  workers: 1,
  timeout: 45000,
  use: {
    baseURL: "http://localhost:5175",
    viewport: { width: 1440, height: 1000 },
    trace: "retain-on-failure",
  },
  reporter: [["list"], ["html", { open: "never" }]],
  webServer: {
    command: "npm run dev -- --host 127.0.0.1 --port 5175 --strictPort",
    url: "http://localhost:5175/api/content",
    reuseExistingServer: false,
    env: {
      MONGODB_URI: "mongodb://127.0.0.1:27020",
      MONGODB_DB: db,
      APP_ORIGIN: "http://localhost:5175",
      ADMIN_EMAIL: "e2e@mohor.local",
      ADMIN_PASSWORD: "Mohor-E2E-only-7284!",
      ADMIN_JWT_SECRET: "e2e-only-test-key-that-is-long-enough-0123456789",
    },
  },
});
