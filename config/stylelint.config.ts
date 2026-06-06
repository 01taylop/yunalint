import postcssLess from 'postcss-less'
import postcssScss from 'postcss-scss'

import Rules from './stylelint/rules'

import type { Config } from 'stylelint'

export default {
  extends: [
    'stylelint-config-property-sort-order-smacss',
  ],
  overrides: [{
    customSyntax: postcssScss,
    files: ['**/*.scss'],
    rules: {
      'annotation-no-unknown': null,
      'at-rule-no-unknown': null, // scss/at-rule-no-unknown
      'comment-no-empty': null, // scss/comment-no-empty
      'function-no-unknown': null, // scss/function-no-unknown
      'import-notation': 'string',
      'media-query-no-invalid': null,
      'no-invalid-position-at-import-rule': [true, {
        ignoreAtRules: ['use', 'forward'],
      }],
      'property-no-unknown': null, // scss/property-no-unknown
      ...Rules.Scss,
    },
    plugins: [
      'stylelint-scss',
    ],
  }, {
    customSyntax: postcssLess,
    files: ['**/*.less'],
    rules: {
      'annotation-no-unknown': null,
      'import-notation': 'string',
      'media-query-no-invalid': null,
      'no-invalid-position-at-import-rule': [true, {
        ignoreAtRules: ['use', 'forward'],
      }],
    },
  }],
  plugins: [
    '@stylistic/stylelint-plugin',
    'stylelint-declaration-strict-value',
    'stylelint-order',
  ],
  rules: {
    ...Rules.DeclarationStrictValue,
    ...Rules.Order,
    ...Rules.Stylelint,
    ...Rules.Stylistic,
  },
} satisfies Config
