import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import reactHooks from 'eslint-plugin-react-hooks';
import globals from 'globals';

// Lean lint layer: catches what Prettier (format) and tsc (types) can't —
// mainly React Hooks dependency bugs and unused bindings. Formatting is left
// entirely to Prettier, so no stylistic rules live here.
export default tseslint.config(
  {
    ignores: ['dist', 'node_modules'],
  },
  {
    files: ['src/**/*.{ts,tsx}'],
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    languageOptions: {
      globals: globals.browser,
    },
    plugins: {
      'react-hooks': reactHooks,
    },
    rules: {
      // Only the two classic Hooks rules — not react-hooks v7's `recommended-latest`,
      // whose React-Compiler rules flag legitimate patterns and drown the signal.
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
      // Unused bindings are noise tsc doesn't flag; allow the _-prefixed escape hatch.
      '@typescript-eslint/no-unused-vars': [
        'warn',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_', caughtErrorsIgnorePattern: '^_' },
      ],
      '@typescript-eslint/no-explicit-any': 'off',
    },
  }
);
