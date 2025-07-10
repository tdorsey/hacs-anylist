module.exports = {
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module'
  },
  rules: {
    'no-unused-vars': 'off',
    'no-console': 'warn',
    'prefer-const': 'error'
  },
  ignorePatterns: ['dist/', 'node_modules/', '*.js', '*.d.ts']
};