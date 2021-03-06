module.exports = {
    root: true,
    'env': {
        'node': true,
        'es6': true,
    },
    'parserOptions': {
        'ecmaVersion': 2018,
    },
    'extends': 'eslint:recommended',
    'rules': {
        'space-before-function-paren': [
            'error',
            {
                'anonymous': 'always',
                'named': 'never',
                'asyncArrow': 'always',
            },
        ],
        'object-curly-spacing': [
            'error',
            'always',
        ],
        'no-console': 'off',
        'no-var': 'error',
        'prefer-const': 'error',
        'indent': [
            'error',
            4,
        ],
        'semi': [
            'error',
            'always',
        ],
        'quotes': [
            'error',
            'single',
        ],
        'object-curly-newline': [
            'error',
            {
                'multiline': true,
                'consistent': true,
            },
        ],
        'comma-dangle': [
            'error',
            'always-multiline',
        ],
        'comma-spacing': [
            'error',
            {
                'before': false,
                'after': true,
            },
        ],
        'comma-style': [
            'error',
            'last',
        ],
        'eol-last': 'error',
        'key-spacing': [
            'error',
            {
                'beforeColon': false,
                'afterColon': true,
            },
        ],
        'keyword-spacing': [
            'error',
            {
                'before': true,
                'after': true,
            },
        ],
        'block-spacing': 'error',
        'space-in-parens': [
            'error',
            'never',
        ],
        'space-before-blocks': 'error',
        'no-trailing-spaces': 'error',
        'semi-spacing': [
            'error',
            {
                'before': false,
                'after': true,
            },
        ],
        'space-infix-ops': 'error',
    },
};
