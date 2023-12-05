module.exports = {
  extends: [
    '@innovixx/eslint-config/configs/base',
    '@innovixx/eslint-config/configs/typescript',
  ],
  ignorePatterns: ['dist/'],
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
  },
};
