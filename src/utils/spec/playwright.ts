import { test as base, expect } from '@playwright/test';
import { type TestHarness, createTestHarness } from 'wrangler';

const configPath = './wrangler.jsonc';
// isWebsite() uses startsWith(), so the trailing colon matches every
// dynamically allocated loopback port without matching another host.
const websiteBase = 'http://127.0.0.1:';

interface TestFixtures {
    reset: undefined;
}

interface WorkerFixtures {
    server?: TestHarness;
}

export const test = base.extend<TestFixtures, WorkerFixtures>({
    server: [
        async ({ browserName }, use) => {
            if (browserName !== 'chromium') {
                throw new Error(
                    `Browser tests require Chromium, received ${browserName}.`,
                );
            }

            if (process.env.PLAYWRIGHT_EXTERNAL_WEB_URL) {
                await use(undefined);
                return;
            }

            const server = createTestHarness({
                workers: [
                    {
                        configPath,
                        vars: { WEBSITE_BASE: websiteBase },
                    },
                ],
            });

            try {
                await use(server);
            } finally {
                await server.close();
            }
        },
        { scope: 'worker', timeout: 120_000 },
    ],
    baseURL: async ({ server }, use) => {
        if (!server) {
            await use(process.env.PLAYWRIGHT_EXTERNAL_WEB_URL);
            return;
        }

        const { url } = await server.listen();
        await use(url.href);
    },
    reset: [
        async ({ server }, use, testInfo) => {
            await use(undefined);

            if (!server) {
                return;
            }

            if (testInfo.status !== testInfo.expectedStatus) {
                server.debug();
            }

            await server.reset();
        },
        { auto: true },
    ],
});

export { expect };
