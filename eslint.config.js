import js from '@eslint/js';
import globals from 'globals';
import react from 'eslint-plugin-react';
import hooks from 'eslint-plugin-react-hooks';
export default [
  { ignores: ['**/node_modules/**', '**/dist/**', '**/coverage/**'] },
  js.configs.recommended,
  { files: ['**/*.js', '**/*.jsx'], languageOptions: { ecmaVersion: 'latest', sourceType: 'module', globals: { ...globals.node } }, rules: { 'no-unused-vars': ['error', { argsIgnorePattern: '^_' }] } },
  { files: ['frontend/**/*.jsx', 'frontend/**/*.js'], languageOptions: { globals: globals.browser, parserOptions: { ecmaFeatures: { jsx: true } } }, plugins: { react, 'react-hooks': hooks }, rules: { 'react/jsx-uses-react': 'error', 'react/jsx-uses-vars': 'error', 'react-hooks/rules-of-hooks': 'error', 'react-hooks/exhaustive-deps': 'error' } },
  { files: ['e2e/**/*.js'], languageOptions: { globals: globals.browser } },
  { files: ['backend/test/**/*.js'], languageOptions: { globals: globals.jest } },
];
