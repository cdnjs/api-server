import { test as base, expect } from '@playwright/test';
import { type TestHarness, createTestHarness } from 'wrangler';

const configPath = './wrangler.jsonc';

interface TestFixtures {
    reset: undefined;
}

interface WorkerFixtures {
    server?: TestHarness;
}

export const createServer = (vars?: Record<string, string>) =>
    createTestHarness({
        workers: [
            {
                configPath,
                vars: {
                    WEBSITE_BASE: 'http://127.0.0.1:*',
                    ...vars,
                },
            },
        ],
    });

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

            const server = createServer();

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
        await use(url.origin);
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

export const wait = <T>(
    callback: () => Promise<T> | T,
    timeout = 1000,
    interval = 50,
): Promise<T> =>
    new Promise<T>(
        // eslint-disable-next-line no-async-promise-executor
        async (resolve, reject) => {
            const signal = AbortSignal.timeout(timeout);
            while (true) {
                try {
                    return resolve(await callback());
                } catch (err) {
                    if (signal.aborted) return reject(err);
                    await new Promise((r) => setTimeout(r, interval));
                }
            }
        },
    );

export { expect };
