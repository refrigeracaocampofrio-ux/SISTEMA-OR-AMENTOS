const js = require('@eslint/js');
const globals = require('globals');
const prettierConfig = require('eslint-config-prettier');

/**
 * ESLint v9+ Flat Config
 * - Node.js + browser (frontend simples)
 * - Regras pragmáticas para codebase existente
 */
module.exports = [
  {
    ignores: ['**/node_modules/**', '**/coverage/**', '**/dist/**', '**/build/**', 'database/**'],
  },
  js.configs.recommended,
  prettierConfig,
  {
    files: ['**/*.js', '**/*.cjs'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'script',
      globals: {
        ...globals.node,
        ...globals.browser,
        ...globals.mocha,
      },
    },
    rules: {
      'no-var': 'error',
      'prefer-const': ['warn', { destructuring: 'all' }],
      'no-unused-vars': [
        'warn',
        { argsIgnorePattern: '^(?:_|err|next)$', varsIgnorePattern: '^_' },
      ],
      'no-constant-binary-expression': 'error',
      'no-useless-catch': 'warn',
      'no-empty': ['warn', { allowEmptyCatch: true }],
      eqeqeq: ['error', 'always', { null: 'ignore' }],
      curly: ['error', 'all'],
      'no-console': 'off',
      'no-redeclare': ['error', { builtinGlobals: false }],
    },
  },
];
