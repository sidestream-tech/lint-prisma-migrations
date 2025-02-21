import antfu from '@antfu/eslint-config'

const ignores = [
  'node_modules',
  '**/node_modules/**',
  'dist',
  '**/dist/**',
  'dist',
  '**/dist/**',
  'lib',
  '**/lib/**',
]

export default antfu({
  ignores,
  yaml: false,
  vue: false,
  rules: {
    // Always force curly braces
    'curly': ['error', 'all'],

    // Use the 1-true-brace-style
    'style/brace-style': ['error', '1tbs'],

    // Always enforce an ending comma on every line
    'comma-dangle': ['error', {
      arrays: 'always-multiline',
      objects: 'always-multiline',
      functions: 'always-multiline',
      exports: 'always-multiline',
      imports: 'always-multiline',
    }],

    // Enforce spacing around operations like `1 + 2`
    'space-infix-ops': ['error'],

    // Consistently use `type` and not `interface` to declare object-types
    'ts/consistent-type-definitions': ['error', 'interface'],

    // Enforce usage of global `process` (instead of `const process = require('process')`)
    'node/prefer-global/process': ['error', 'always'],

    // Not enforced right now as our code-base doesn't adhere to it at time of switch. TODO: Enable this
    'ts/no-use-before-define': 'off',

    // Do not allow unused expressions
    'no-unused-expressions': ['error'],

    // Do not allow re-assigning parameters inside a function
    'no-param-reassign': ['error'],

    // Do not allow implicit switch-fallthrough
    'no-fallthrough': ['error'],

    'require-await': ['error'],

    'no-console': ['off'],
  },
})
