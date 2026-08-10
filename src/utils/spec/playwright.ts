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
    server: TestHarness;
}

export const test = base.extend<TestFixtures, WorkerFixtures>({
    server: [
        async ({ browserName }, use) => {
            if (browserName !== 'chromium') {
                throw new Error(
                    `Browser tests require Chromium, received ${browserName}.`,
                );
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
                const { url } = await server.listen();
                if (!url.origin.startsWith(websiteBase)) {
                    throw new Error(
                        `Local Worker origin ${url.origin} does not match website base ${websiteBase}.`,
                    );
                }

                const workerEnv = await server
                    .getWorker<{ WEBSITE_BASE: string }>()
                    .getEnv();
                if (workerEnv.WEBSITE_BASE !== websiteBase) {
                    throw new Error(
                        `Local Worker WEBSITE_BASE is ${workerEnv.WEBSITE_BASE}, expected ${websiteBase}.`,
                    );
                }

                const response = await fetch(new URL('/health', url));
                const body = await response.text();
                if (!response.ok || body !== 'OK') {
                    throw new Error(
                        `Local website health check failed with status ${String(response.status)} and body ${JSON.stringify(body)}.`,
                    );
                }

                await use(server);
            } finally {
                await server.close();
            }
        },
        { scope: 'worker', timeout: 120_000 },
    ],
    baseURL: async ({ server }, use) => {
        const { url } = await server.listen();
        await use(url.href);
    },
    reset: [
        async ({ server }, use, testInfo) => {
            await use(undefined);

            if (testInfo.status !== testInfo.expectedStatus) {
                server.debug();
            }

            await server.reset();
        },
        { auto: true },
    ],
});

export { expect };
