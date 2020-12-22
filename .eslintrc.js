// @typescript-eslint specific file
// doesn't handle nodejs requires
module.exports = {
  root: true,
  env: {
    node: true,
    commonjs: true,
    es2021: true,
  },
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint', 'prettier'],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'prettier',
    'prettier/@typescript-eslint',
    //"plugin:@typescript-eslint/recommended-requiring-type-checking",
  ],
  rules: {
    '@typescript-eslint/no-inferrable-types': [
      2,
      {
        ignoreParameters: true,
        ignoreProperties: false,
      },
    ],
    '@typescript-eslint/no-empty-function': [0],
    'prettier/prettier': [
      1,
      {},
      {
        fileInfoOptions: {
          withNodeModules: true,
        },
      },
    ],
  },
  overrides: [
    {
      files: ['**/*.js'],
      env: {
        node: true,
        commonjs: true,
        es2021: true,
      },
      extends: 'eslint:recommended',
      parserOptions: {
        ecmaVersion: 12,
      },
      rules: {
        indent: ['error', 2],
        'linebreak-style': ['error', 'unix'],
        semi: ['error', 'always'],
      },
    },
  ],
};
