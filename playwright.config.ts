import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  webServer: {
    command: 'npm run dev',
    url: 'https://localhost:5173',
    reuseExistingServer: !process.env.CI,
    ignoreHTTPSErrors: true,
  },
  use: {
    baseURL: 'https://localhost:5173',
    ignoreHTTPSErrors: true,
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
});
