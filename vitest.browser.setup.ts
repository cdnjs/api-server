import { unstable_dev } from 'wrangler';

const host = '127.0.0.1';

/**
 * Start a local Worker for the browser test project.
 */
export default async function setup() {
    if (process.env.VITEST_EXTERNAL_API_URL) return;

    const workerPort = Number(process.env.VITEST_BROWSER_WORKER_PORT);
    const inspectorPort = Number(process.env.VITEST_BROWSER_INSPECTOR_PORT);
    if (!workerPort || !inspectorPort) {
        throw new Error('Browser test Worker ports were not configured.');
    }

    const worker = await unstable_dev('src/index.ts', {
        config: './wrangler.toml',
        ip: host,
        port: workerPort,
        inspectorPort,
        local: true,
        logLevel: 'error',
        experimental: {
            disableExperimentalWarning: true,
            showInteractiveDevSession: false,
            watch: false,
        },
    });

    const response = await worker.fetch('/api');
    if (!response.ok) {
        await worker.stop();
        throw new Error(
            `Local Worker health check failed with status ${String(response.status)}.`,
        );
    }

    return () => worker.stop();
}
