import { test as base, expect } from '@playwright/test';
import { createTestHarness } from 'wrangler';

const configPath = './wrangler.jsonc';
// isWebsite() uses startsWith(), so the trailing colon matches every
// dynamically allocated loopback port without matching another host.
const websiteBase = 'http://127.0.0.1:';

interface WorkerFixtures {
    workerUrl: string;
}

export const test = base.extend<Record<never, never>, WorkerFixtures>({
    workerUrl: [
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

                await use(url.href);
            } finally {
                await server.close();
            }
        },
        { scope: 'worker', timeout: 120_000 },
    ],
    baseURL: async ({ workerUrl }, use) => {
        await use(workerUrl);
    },
});

export { expect };
