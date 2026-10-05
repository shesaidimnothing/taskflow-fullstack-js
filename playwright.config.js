import { defineConfig } from '@playwright/test';
export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  workers: 1,
  use: { baseURL: 'http://127.0.0.1:3100', ...(process.env.PLAYWRIGHT_CHANNEL ? { channel: process.env.PLAYWRIGHT_CHANNEL } : {}), trace: 'retain-on-failure' },
  webServer: { command: 'node scripts/e2e-server.js', url: 'http://127.0.0.1:3100/api/health', reuseExistingServer: false, timeout: 120000 },
});
