module.exports = {
    env: {
        browser: true,
        node: true,
        es2020: true,
    },
    parser: '@typescript-eslint/parser',
    parserOptions: {
        ecmaVersion: 2020,
        sourceType: 'module',
        ecmaFeatures: {
            jsx: true,
        },
    },
    plugins: ['@typescript-eslint', 'react', 'prettier'],
    extends: [
        'airbnb',
        'plugin:@typescript-eslint/recommended',
        'plugin:import/errors',
        'plugin:import/warnings',
        'plugin:import/typescript',
        'prettier',
        'prettier/@typescript-eslint',
    ],
    rules: {
        'no-new': 0,
        'import/extensions': 0,
        'prettier/prettier': 'error',
        'no-shadow': 'off',
        '@typescript-eslint/no-shadow': ['error'],
    },
    settings: {
        'import/resolver': {
            typescript: {},
        },
    },
}
