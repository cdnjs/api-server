import { playwright } from '@vitest/browser-playwright';
import { createServer } from 'node:net';
import { defineConfig } from 'vitest/config';

const host = '127.0.0.1';

const findAvailablePorts = async (count: number) => {
    const ports = new Set<number>();

    while (ports.size < count) {
        const port = await new Promise<number>((resolve, reject) => {
            const server = createServer();
            server.unref();
            server.once('error', reject);
            server.listen(0, host, () => {
                const address = server.address();
                if (!address || typeof address === 'string') {
                    server.close();
                    reject(
                        new Error('Unable to allocate a browser test port.'),
                    );
                    return;
                }

                server.close((error) => {
                    if (error) {
                        reject(error);
                        return;
                    }

                    resolve(address.port);
                });
            });
        });

        ports.add(port);
    }

    return [...ports];
};

const readConfiguredPorts = (keys: string[]) => {
    const ports = keys.map((key) => {
        const port = Number(process.env[key]);
        return Number.isInteger(port) && port > 0 && port <= 65_535
            ? port
            : undefined;
    });

    return ports.every((port): port is number => port !== undefined)
        ? ports
        : null;
};

const externalApiUrl = process.env.VITEST_EXTERNAL_API_URL?.replace(/\/+$/, '');
const portEnvironmentKeys = externalApiUrl
    ? ['VITEST_BROWSER_API_PORT']
    : [
          'VITEST_BROWSER_API_PORT',
          'VITEST_BROWSER_WORKER_PORT',
          'VITEST_BROWSER_INSPECTOR_PORT',
      ];
const ports =
    readConfiguredPorts(portEnvironmentKeys) ??
    (await findAvailablePorts(portEnvironmentKeys.length));
portEnvironmentKeys.forEach((key, index) => {
    process.env[key] = String(ports[index]);
});

const [browserPort, workerPort, inspectorPort] = ports;

if (!browserPort) {
    throw new Error('Unable to allocate the browser server port.');
}

if (!externalApiUrl && (!workerPort || !inspectorPort)) {
    throw new Error('Unable to allocate the local Worker ports.');
}

const workerTarget = externalApiUrl ?? `http://${host}:${String(workerPort)}`;

export default defineConfig({
    server: {
        host,
        proxy: {
            '/__worker': {
                target: workerTarget,
                changeOrigin: true,
                rewrite: (path: string) => path.replace(/^\/__worker/, ''),
            },
            '/islands': {
                target: workerTarget,
                changeOrigin: true,
            },
        },
    },
    test: {
        expect: {
            poll: {
                timeout: 10_000,
            },
        },
        include: ['src/**/*.browser.spec.ts'],
        globalSetup: './vitest.browser.setup.ts',
        testTimeout: 30_000,
        browser: {
            api: {
                host,
                port: browserPort,
                strictPort: true,
            },
            enabled: true,
            headless: true,
            screenshotFailures: false,
            provider: playwright({ actionTimeout: 10_000 }),
            instances: [{ browser: 'chromium' }],
        },
    },
});
