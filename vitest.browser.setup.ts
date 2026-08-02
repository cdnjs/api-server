import { createTestHarness } from 'wrangler';

const configPath = './wrangler.jsonc';
const websiteBase = 'http://127.0.0.1:';

/**
 * Start a local Worker for the browser test project.
 */
export default async function setup() {
    const externalApiUrl = process.env.VITEST_EXTERNAL_API_URL?.replace(
        /\/+$/,
        '',
    );
    if (externalApiUrl) {
        process.env.VITEST_BROWSER_WORKER_URL = externalApiUrl;
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
                [
                    `Local website health check failed with status ${String(response.status)}`,
                    `and body ${JSON.stringify(body)}.`,
                    `Harness origin: ${url.origin}.`,
                    `Response URL: ${response.url || '<missing>'}.`,
                ].join(' '),
            );
        }

        process.env.VITEST_BROWSER_WORKER_URL = url.origin;
        return async () => {
            delete process.env.VITEST_BROWSER_WORKER_URL;
            await server.close();
        };
    } catch (error) {
        await server.close();
        throw error;
    }
}
