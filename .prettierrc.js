module.exports = {
  // Basic formatting
  printWidth: 100,
  tabWidth: 2,
  useTabs: false,
  semi: true,
  singleQuote: true,
  quoteProps: 'as-needed',
  trailingComma: 'es5',
  bracketSpacing: true,
  bracketSameLine: false,
  arrowParens: 'avoid',
  
  // Language-specific overrides
  overrides: [
    {
      files: '*.json',
      options: {
        parser: 'json',
        singleQuote: false
      }
    },
    {
      files: '*.md',
      options: {
        parser: 'markdown',
        printWidth: 80,
        proseWrap: 'always'
      }
    },
    {
      files: ['*.js', '*.jsx'],
      options: {
        parser: 'babel'
      }
    },
    {
      files: ['*.ts', '*.tsx'],
      options: {
        parser: 'typescript'
      }
    },
    {
      files: '*.css',
      options: {
        parser: 'css'
      }
    }
  ]
};
