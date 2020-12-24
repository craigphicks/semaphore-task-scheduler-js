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
    '@typescript-eslint/no-var-requires': 0,
    '@typescript-eslint/no-inferrable-types': [
      2,
      {
        ignoreParameters: true,
        ignoreProperties: false,
      },
    ],
    '@typescript-eslint/no-empty-function': [0],
    '@typescript-eslint/no-explicit-any': [
      1,
      {
        fixToUnknown: false,
        ignoreRestArgs: true,
      },
    ],
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
        indent: 0, // ['error', 2] conflicting with prettier
        'linebreak-style': ['error', 'unix'],
        semi: ['error', 'always'],
      },
    },
  ],
};
