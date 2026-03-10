// @ts-check
import eslint from '@eslint/js';
import prettier from 'eslint-config-prettier';
import jsdoc from 'eslint-plugin-jsdoc';
import { defineConfig } from 'eslint/config';
import tseslint from 'typescript-eslint';

export default defineConfig(
    eslint.configs.recommended,
    tseslint.configs.strict,
    tseslint.configs.stylistic,
    jsdoc.configs['flat/recommended-mixed'],
    {
        name: 'prettier/config',
        ...prettier,
    },
    {
        name: 'custom/jsdoc',
        rules: {
            'jsdoc/require-returns': 'off',
            'jsdoc/tag-lines': ['error', 'any', { startLines: 1 }],
        },
    },
    {
        name: 'custom/spec',
        files: ['**/spec/**/*.ts', '**/*.spec.ts'],
        rules: {
            '@typescript-eslint/no-unused-expressions': 'off',
            '@typescript-eslint/no-non-null-assertion': 'off',
        },
    },
    {
        name: 'custom/ignores',
        ignores: ['dist-worker/**', '.wrangler/**', 'types/worker.d.ts'],
    },
);
