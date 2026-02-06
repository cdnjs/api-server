import { defineWorkersConfig } from '@cloudflare/vitest-pool-workers/config';

export default defineWorkersConfig({
    test: {
        silent: 'passed-only',
        reporters: [
            'verbose',
            process.env.GITHUB_ACTIONS && 'github-actions',
        ].filter(Boolean),
        poolOptions: {
            workers: {
                wrangler: { configPath: './wrangler.toml' },
                miniflare: {
                    bindings: {
                        DISABLE_LOGGING: true,
                        VITEST_EXTERNAL_API_URL: process.env.VITEST_EXTERNAL_API_URL || '',
                    },
                },
            },
        },
    },
});
