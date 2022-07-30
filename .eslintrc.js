module.exports = {
    root: true,
    extends: '@react-native-community',
    plugins: ['prettier'],
    env: {
        jest: true,
    },
    rules: {
        'prettier/prettier': ['error', { endOfLine: 'auto' }],
        '@typescript-eslint/no-unused-vars': 'off',
        'react-native/no-inline-styles': 'off',
    },
};
