import { cloudflareTest } from '@cloudflare/vitest-pool-workers';
import { configDefaults, defineConfig } from 'vitest/config';

export default defineConfig({
    test: {
        exclude: [...configDefaults.exclude, '**/*.browser.spec.ts'],
        globalSetup: './vitest.setup.ts',
        silent: 'passed-only',
        reporters: [
            'tree',
            ...(process.env.GITHUB_ACTIONS ? ['github-actions'] : []),
        ],
    },
    plugins: [
        cloudflareTest({
            wrangler: { configPath: './wrangler.jsonc' },
            miniflare: {
                bindings: {
                    DISABLE_LOGGING: true,
                    VITEST_EXTERNAL_API_URL:
                        process.env.VITEST_EXTERNAL_API_URL || '',
                },
            },
        }),
    ],
});
