module.exports = {
  env: {
    node: true,
    es2021: true,
    jest: true
  },
  extends: [
    'eslint:recommended',
    'plugin:node/recommended',
    'plugin:security/recommended',
    'prettier'
  ],
  plugins: [
    'node',
    'security'
  ],
  parserOptions: {
    ecmaVersion: 2021,
    sourceType: 'module'
  },
  rules: {
    // Error prevention
    'no-console': process.env.NODE_ENV === 'production' ? 'error' : 'warn',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'warn',
    'no-unused-vars': ['error', { 
      argsIgnorePattern: '^_',
      varsIgnorePattern: '^_' 
    }],
    
    // Code style
    'indent': ['error', 2],
    'quotes': ['error', 'single'],
    'semi': ['error', 'always'],
    
    // Security
    'security/detect-object-injection': 'error',
    'security/detect-non-literal-regexp': 'error',
    
    // Node.js specific
    'node/no-unpublished-require': 'off',
    'node/no-missing-require': 'error',
    'node/exports-style': ['error', 'module.exports'],
    
    // Best practices
    'eqeqeq': ['error', 'always'],
    'curly': ['error', 'all'],
    'dot-notation': 'error',
    'no-eval': 'error',
    'no-implied-eval': 'error',
    'no-new-func': 'error',
    'no-param-reassign': 'error',
    'prefer-const': 'error',
    'no-var': 'error'
  },
  ignorePatterns: [
    'node_modules/',
    'dist/',
    'build/',
    'logs/',
    'tmp/',
    'uploads/'
  ]
};
