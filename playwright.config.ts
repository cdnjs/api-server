import { defineConfig } from '@playwright/test';

export default defineConfig({
    testDir: './src',
    testMatch: '**/*.browser.spec.ts',
    outputDir: '.playwright/results',
    reporter: [
        ['list', { printSteps: true }],
        ['html', { outputFolder: '.playwright/report' }],
        ...(process.env.GITHUB_ACTIONS ? [['github'] as const] : []),
    ],
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
