import { playwright } from '@vitest/browser-playwright';
import { createServer } from 'node:net';
import { defineConfig } from 'vitest/config';

const host = '127.0.0.1';
const fallbackWorkerTarget =
    process.env.VITEST_EXTERNAL_API_URL?.replace(/\/+$/, '') ??
    `http://${host}`;
const resolveWorkerTarget = () =>
    process.env.VITEST_BROWSER_WORKER_URL ?? fallbackWorkerTarget;
const proxyToWorker: typeof fetch = async (input, init) => {
    const sourceUrl = new URL(input instanceof Request ? input.url : input);
    const targetUrl = new URL(
        `${sourceUrl.pathname}${sourceUrl.search}`,
        resolveWorkerTarget(),
    );
    const headers = new Headers(init?.headers);
    // Node fetch decodes compressed bodies while preserving their encoding header.
    // Request identity encoding so the browser receives bytes matching the headers.
    headers.set('accept-encoding', 'identity');

    return fetch(targetUrl, { ...init, headers });
};

const configuredPort = Number(process.env.VITEST_BROWSER_API_PORT);
const browserPort =
    Number.isInteger(configuredPort) &&
    configuredPort > 0 &&
    configuredPort <= 65_535
        ? configuredPort
        : await new Promise<number>((resolve, reject) => {
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

export default defineConfig({
    server: {
        host,
        proxy: {
            '/__worker': {
                target: fallbackWorkerTarget,
                changeOrigin: true,
                fetch: proxyToWorker,
                rewrite: (path: string) => path.replace(/^\/__worker/, ''),
            },
            '/islands': {
                target: fallbackWorkerTarget,
                changeOrigin: true,
                fetch: proxyToWorker,
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
                // The probe releases the port before Vite binds it. Let Vite
                // advance if another process wins that race.
                strictPort: false,
            },
            enabled: true,
            headless: true,
            screenshotFailures: false,
            provider: playwright({ actionTimeout: 10_000 }),
            instances: [{ browser: 'chromium' }],
        },
    },
});
