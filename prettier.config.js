// @ts-check

/**
 * @see https://prettier.io/docs/configuration
 * @type {import('prettier').Config}
 */
export default {
    plugins: ['@trivago/prettier-plugin-sort-imports'],
    singleQuote: true,
    importOrder: ['<THIRD_PARTY_MODULES>', '^\\.\\.', '^\\.'],
    importOrderSeparation: true,
    importOrderSortSpecifiers: true,
    importOrderSideEffects: false,
};
