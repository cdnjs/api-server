// @ts-check

/**
 * @see https://github.com/lint-staged/lint-staged#configuration
 * @type {import('lint-staged').Configuration}
 */
export default {
    '*': 'prettier --write --ignore-unknown',
};
