import { defineConfig, devices } from '@playwright/test';
import path from 'path';

/**
 * Read environment variables from file.
 * https://github.com/motdotla/dotenv
 */
// require('dotenv').config({ path: path.resolve(__dirname, '.env') });

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  testDir: './e2e',
  /* Run tests in files in parallel */
  fullyParallel: false,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  /* Opt out of parallel tests to avoid DB collisions */
  workers: 1,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: 'html',
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('/')`. */
    baseURL: 'http://localhost:3001',

    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'on-first-retry',
  },

  /* Configure projects for major browsers */
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],

  /* Run your local dev server before starting the tests */
  webServer: [
    {
      // Run the standalone E2E database
      command: 'docker compose -f ../docker-compose.test.yml up test-db',
      port: 5434, // Wait for TCP connection instead of HTTP
      reuseExistingServer: true,
      timeout: 120 * 1000,
    },
    {
      // Run backend pointed at test DB
      command: 'cd ../backend && mvn spring-boot:run -Dspring-boot.run.profiles=test',
      url: 'http://localhost:8081/api/v1/health',
      reuseExistingServer: !process.env.CI,
      timeout: 120 * 1000,
    },
    {
      // Run frontend dev server
      command: 'NEXT_PUBLIC_API_URL=http://localhost:8081/api npm run dev -- -p 3001',
      url: 'http://localhost:3001',
      reuseExistingServer: !process.env.CI,
      timeout: 120 * 1000,
    }
  ],
});
