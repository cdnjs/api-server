import { createTestHarness } from 'wrangler';

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
        workers: [{ configPath: './wrangler.toml' }],
    });
    const { url } = await server.listen();

    const response = await server.fetch('/health');
    if (!response.ok) {
        await server.close();
        throw new Error(
            `Local Worker health check failed with status ${String(response.status)}.`,
        );
    }

    process.env.VITEST_BROWSER_WORKER_URL = url.origin;
    return async () => {
        delete process.env.VITEST_BROWSER_WORKER_URL;
        await server.close();
    };
}
