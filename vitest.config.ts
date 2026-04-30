import { cloudflareTest } from '@cloudflare/vitest-pool-workers';
import { stripVTControlCharacters } from 'node:util';
import { defineConfig } from 'vitest/config';

// FIXME: https://github.com/cloudflare/workers-sdk/issues/12014
const originalLog = console.log;
console.log = (...args) => {
    const prefix =
        typeof args[0] === 'string'
            ? stripVTControlCharacters(args[0]).split(' ')[0]
            : undefined;
    if (prefix === '[vpw:debug]' || prefix === '[vpw:info]') return;
    return originalLog(...args);
};

export default defineConfig({
    test: {
        globalSetup: './vitest.setup.ts',
        silent: 'passed-only',
        reporters: [
            'tree',
            process.env.GITHUB_ACTIONS && 'github-actions',
        ].filter((x): x is string => !!x),
    },
    plugins: [
        cloudflareTest({
            wrangler: { configPath: './wrangler.toml' },
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
