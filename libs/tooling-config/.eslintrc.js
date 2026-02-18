/**
 * Shared ESLint configuration for docflow-360
 * 
 * Per 2026 playbook: Consistent linting across all TypeScript apps
 */

module.exports = {
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
  },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
  ],
  rules: {
    // Enforce no any types
    '@typescript-eslint/no-explicit-any': 'error',
    // Prefer const over let
    'prefer-const': 'error',
    // Require explicit return types on functions
    '@typescript-eslint/explicit-function-return-type': 'warn',
    // No unused vars (except those prefixed with _)
    '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
  },
};
