import { defineConfig } from '@playwright/test';

export default defineConfig({
    testDir: './src',
    testMatch: '**/*.browser.spec.ts',
    outputDir: '.wrangler/playwright-results',
    workers: 1,
    timeout: 30_000,
    expect: {
        timeout: 10_000,
    },
    use: {
        browserName: 'chromium',
        headless: true,
    },
});

# Fix for issue #56: safe input handling
