import { defineConfig, globalIgnores } from 'eslint/config';
import onlyWarn from 'eslint-plugin-only-warn';
import typescriptEslint from '@typescript-eslint/eslint-plugin';
import _import from 'eslint-plugin-import';
import angularEslint from '@angular-eslint/eslint-plugin';
import angularEslintTemplate from '@angular-eslint/eslint-plugin-template';
import { fixupPluginRules } from '@eslint/compat';
import globals from 'globals';
import tsParser from '@typescript-eslint/parser';
import parser from '@angular-eslint/template-parser';
import prettierPlugin from 'eslint-plugin-prettier';
import prettierConfig from 'eslint-config-prettier';

export default defineConfig([
  globalIgnores([
    '**/**/mockServiceWorker.js',
    'node_modules/',
    '.idea',
    '.angular',
    'dist/',
    '.vscode',
    'test/dist',
    'playwright-report',
    'coverage',
    '**/**/tealium.js',
  ]),
  prettierConfig,
  {
    files: ['**/*.ts'],

    plugins: {
      'only-warn': onlyWarn,
      '@typescript-eslint': typescriptEslint,
      import: fixupPluginRules(_import),
      '@angular-eslint': angularEslint,
      '@angular-eslint/template': angularEslintTemplate,
      prettier: prettierPlugin,
    },

    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
        ...globals.vitest,
      },

      parser: tsParser,
      ecmaVersion: 2020,
      sourceType: 'module',

      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },

    settings: {
      'import/resolver': {
        typescript: {
          alwaysTryTypes: true,
          project: ['./tsconfig.app.json', './tsconfig.spec.json'],
        },
        node: true,
      },
    },

    rules: {
      'import/default': 'error',
      'import/dynamic-import-chunkname': 'off',
      'import/export': 'error',
      'import/exports-last': 'error',
      'import/extensions': 'off',
      'import/first': 'off',
      'import/group-exports': 'off',

      'import/max-dependencies': 'off',

      'import/named': 'off',
      'import/namespace': 'off',

      'import/newline-after-import': 'error',

      'import/no-absolute-path': 'error',
      'import/no-amd': 'error',

      'import/no-anonymous-default-export': 'error',

      'import/no-commonjs': 'error',

      'import/no-cycle': 'error',

      'import/no-default-export': 'error',
      'import/no-deprecated': 'error',

      'import/no-duplicates': 'error',

      'import/no-dynamic-require': 'off',

      'import/no-extraneous-dependencies': 'off',

      'import/no-import-module-exports': 'error',
      'import/no-internal-modules': 'off',
      'import/no-mutable-exports': 'error',
      'import/no-named-as-default-member': 'error',
      'import/no-named-as-default': 'error',
      'import/no-named-default': 'error',
      'import/no-named-export': 'off',
      'import/no-namespace': 'off',
      'import/no-nodejs-modules': 'error',
      'import/no-relative-packages': 'error',
      'import/no-relative-parent-imports': 'error',
      'import/no-restricted-paths': 'error',
      'import/no-self-import': 'error',
      'import/no-unassigned-import': 'error',

      'import/no-unused-modules': 'off',

      'import/no-useless-path-segments': 'error',

      'import/no-webpack-loader-syntax': 'error',

      'import/order': [
        'error',
        {
          groups: [
            'builtin',
            'external',
            'internal',
            'parent',
            'sibling',
            'index',
            'object',
            'type',
          ],

          pathGroups: [
            {
              pattern: '@angular/**',
              group: 'external',
            },
            {
              pattern: '@app/**',
              group: 'internal',
            },
          ],

          'newlines-between': 'always',

          alphabetize: {
            order: 'ignore',
            caseInsensitive: true,
          },

          warnOnUnassignedImports: true,
        },
      ],

      'import/prefer-default-export': 'off',

      '@angular-eslint/component-class-suffix': 'off',

      '@angular-eslint/component-max-inline-declarations': [
        'error',
        {
          template: 0,
          styles: 0,
          animations: 0,
        },
      ],

      '@angular-eslint/component-selector': [
        'error',
        {
          type: 'element',
          prefix: ['app'],
          style: 'kebab-case',
        },
      ],

      '@angular-eslint/consistent-component-styles': ['error', 'array'],
      '@angular-eslint/contextual-decorator': 'error',
      '@angular-eslint/contextual-lifecycle': 'error',

      '@angular-eslint/directive-class-suffix': [
        'error',
        {
          suffixes: ['Directive'],
        },
      ],

      '@angular-eslint/directive-selector': [
        'error',
        {
          type: 'attribute',
          prefix: ['app'],
          style: 'camelCase',
        },
      ],

      '@angular-eslint/no-async-lifecycle-method': 'error',
      '@angular-eslint/no-attribute-decorator': 'error',
      '@angular-eslint/no-conflicting-lifecycle': 'error',
      '@angular-eslint/no-duplicates-in-metadata-arrays': 'error',
      '@angular-eslint/no-empty-lifecycle-method': 'error',
      '@angular-eslint/no-forward-ref': 'off',
      '@angular-eslint/no-input-prefix': 'error',
      '@angular-eslint/no-input-rename': 'error',
      '@angular-eslint/no-inputs-metadata-property': 'error',
      '@angular-eslint/no-lifecycle-call': 'error',
      '@angular-eslint/no-output-native': 'error',
      '@angular-eslint/no-output-on-prefix': 'off',
      '@angular-eslint/no-output-rename': 'error',
      '@angular-eslint/no-outputs-metadata-property': 'error',
      '@angular-eslint/no-pipe-impure': 'error',
      '@angular-eslint/no-queries-metadata-property': 'error',

      '@angular-eslint/pipe-prefix': 'off',

      '@angular-eslint/prefer-on-push-component-change-detection': 'off',
      '@angular-eslint/prefer-output-readonly': 'error',
      '@angular-eslint/prefer-standalone': 'off',
      '@angular-eslint/relative-url-prefix': 'error',

      '@angular-eslint/require-localize-metadata': 'off',

      '@angular-eslint/runtime-localize': 'error',
      '@angular-eslint/use-component-selector': 'error',
      '@angular-eslint/use-component-view-encapsulation': 'off',
      '@angular-eslint/use-injectable-provided-in': 'error',
      '@angular-eslint/use-lifecycle-interface': 'error',
      '@angular-eslint/use-pipe-transform-interface': 'error',
      '@typescript-eslint/adjacent-overload-signatures': 'error',

      '@typescript-eslint/array-type': 'error',

      '@typescript-eslint/await-thenable': 'error',
      '@typescript-eslint/ban-ts-comment': 'error',
      '@typescript-eslint/ban-tslint-comment': 'error',
      '@typescript-eslint/class-literal-property-style': 'error',

      '@typescript-eslint/class-methods-use-this': 'off',

      '@typescript-eslint/consistent-generic-constructors': 'error',
      '@typescript-eslint/consistent-indexed-object-style': 'off',

      '@typescript-eslint/consistent-return': 'off',

      '@typescript-eslint/consistent-type-assertions': 'off',

      '@typescript-eslint/consistent-type-definitions': 'off',

      '@typescript-eslint/consistent-type-exports': [
        'error',
        {
          fixMixedExportsWithInlineTypeSpecifier: true,
        },
      ],

      '@typescript-eslint/consistent-type-imports': [
        'error',
        {
          prefer: 'no-type-imports',
          disallowTypeAnnotations: true,
        },
      ],

      '@typescript-eslint/default-param-last': ['error'],
      // "@typescript-eslint/dot-notation": ["error"],
      // "@typescript-eslint/no-unnecessary-type-assertion": ["error"],
      'prettier/prettier': 'error',

      '@typescript-eslint/explicit-function-return-type': [
        'error',
        {
          allowExpressions: false,
          allowTypedFunctionExpressions: true,
          allowHigherOrderFunctions: false,
          allowDirectConstAssertionInArrowFunctions: false,
          allowConciseArrowFunctionExpressionsStartingWithVoid: false,
        },
      ],

      '@typescript-eslint/explicit-member-accessibility': [
        'error',
        {
          accessibility: 'no-public',
        },
      ],

      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/init-declarations': ['off'],

      '@typescript-eslint/max-params': [
        'off',
        {
          max: 3,
          countVoidThis: false,
        },
      ],

      '@typescript-eslint/member-ordering': [
        'error',
        {
          default: [
            'signature',
            'static-field',
            'abstract-field',
            ['abstract-get', 'abstract-set'],
            'abstract-method',
            'public-decorated-field',
            [
              'public-decorated-get',
              'public-decorated-set',
              'public-instance-get',
              'public-instance-set',
            ],
            'public-instance-field',
            'protected-instance-field',
            ['protected-instance-get', 'protected-instance-set'],
            'private-instance-field',
            ['private-instance-get', 'private-instance-set'],
            'constructor',
            'public-decorated-method',
            'public-instance-method',
            'protected-decorated-method',
            'protected-instance-method',
            'private-decorated-method',
            'private-instance-method',
          ],
        },
      ],

      '@typescript-eslint/method-signature-style': ['error', 'property'],

      '@typescript-eslint/naming-convention': [
        'off',
        {
          selector: 'variable',
          format: ['camelCase'],
          types: ['string', 'number', 'array', 'function'],
        },
        {
          selector: 'variable',
          types: ['boolean'],
          format: ['PascalCase'],
          prefix: ['is', 'should', 'has', 'can', 'did', 'will'],
        },
        {
          selector: 'variable',
          modifiers: ['destructured'],
          types: ['boolean', 'string', 'number', 'array', 'function'],
          format: null,
        },
        {
          selector: 'function',
          format: ['camelCase'],
        },
        {
          selector: 'parameter',
          format: ['camelCase'],
          types: ['boolean', 'string', 'number', 'array', 'function'],
        },
        {
          selector: 'parameter',
          modifiers: ['destructured'],
          format: null,
          types: ['boolean', 'string', 'number', 'array', 'function'],
        },
        {
          selector: 'classProperty',
          format: ['camelCase'],
          types: ['boolean', 'string', 'number', 'array', 'function'],
        },
        {
          selector: 'classProperty',
          modifiers: ['private'],
          format: ['camelCase'],
          types: ['boolean', 'string', 'number', 'array', 'function'],
          leadingUnderscore: 'allow',
        },
        {
          selector: 'typeProperty',
          format: ['camelCase'],
          types: ['boolean', 'string', 'number', 'array', 'function'],
        },
        {
          selector: 'parameterProperty',
          format: ['UPPER_CASE'],
          types: ['boolean', 'string', 'number', 'array', 'function'],
        },
        {
          selector: 'classMethod',
          format: ['camelCase'],
        },
        {
          selector: 'objectLiteralMethod',
          format: ['camelCase'],
        },
        {
          selector: 'typeMethod',
          format: ['camelCase'],
        },
        {
          selector: 'enumMember',
          format: ['UPPER_CASE'],
        },
        {
          selector: 'class',
          format: ['PascalCase'],
        },
        {
          selector: 'interface',
          format: ['PascalCase'],
          prefix: ['I'],
        },
        {
          selector: 'typeAlias',
          format: ['PascalCase'],
          prefix: ['T'],
        },
        {
          selector: 'enum',
          format: ['PascalCase'],
          prefix: ['E'],
        },
        {
          selector: 'typeParameter',
          format: ['PascalCase'],
        },
      ],

      '@typescript-eslint/no-array-constructor': 'error',
      '@typescript-eslint/no-array-delete': 'error',
      '@typescript-eslint/no-base-to-string': 'error',
      '@typescript-eslint/no-confusing-non-null-assertion': 'error',

      '@typescript-eslint/no-confusing-void-expression': [
        'error',
        {
          ignoreArrowShorthand: false,
          ignoreVoidOperator: false,
        },
      ],

      '@typescript-eslint/no-deprecated': 'off',
      '@typescript-eslint/no-dupe-class-members': 'error',
      '@typescript-eslint/no-duplicate-enum-values': 'error',
      '@typescript-eslint/no-duplicate-type-constituents': 'error',
      '@typescript-eslint/no-dynamic-delete': 'error',
      '@typescript-eslint/no-empty-function': ['error'],

      '@typescript-eslint/no-empty-interface': [
        'error',
        {
          allowSingleExtends: false,
        },
      ],

      '@typescript-eslint/no-empty-object-type': [
        'error',
        {
          allowInterfaces: 'never',
          allowObjectTypes: 'never',
        },
      ],

      '@typescript-eslint/no-explicit-any': [
        'off',
        {
          fixToUnknown: false,
          ignoreRestArgs: false,
        },
      ],

      '@typescript-eslint/no-extra-non-null-assertion': 'error',

      '@typescript-eslint/no-extraneous-class': [
        'error',
        {
          allowConstructorOnly: false,
          allowEmpty: false,
          allowStaticOnly: true,
          allowWithDecorator: true,
        },
      ],

      '@typescript-eslint/no-floating-promises': [
        'off',
        {
          checkThenables: false,
          ignoreVoid: true,
          ignoreIIFE: false,
        },
      ],

      '@typescript-eslint/no-for-in-array': 'error',
      '@typescript-eslint/no-implied-eval': ['error'],

      '@typescript-eslint/no-inferrable-types': [
        'error',
        {
          ignoreParameters: false,
          ignoreProperties: false,
        },
      ],

      '@typescript-eslint/no-invalid-this': ['error'],

      '@typescript-eslint/no-invalid-void-type': [
        'error',
        {
          allowInGenericTypeArguments: true,
          allowAsThisParameter: false,
        },
      ],

      '@typescript-eslint/no-loop-func': ['error'],

      '@typescript-eslint/no-magic-numbers': [
        'off',
        {
          ignoreArrayIndexes: true,
          ignoreDefaultValues: true,
          enforceConst: true,
          detectObjects: true,
          ignoreEnums: true,
          ignoreNumericLiteralTypes: false,
          ignoreReadonlyClassProperties: true,
          ignoreTypeIndexes: true,
        },
      ],

      '@typescript-eslint/no-meaningless-void-operator': [
        'error',
        {
          checkNever: false,
        },
      ],

      '@typescript-eslint/no-misused-new': 'error',

      '@typescript-eslint/no-misused-promises': [
        'error',
        {
          checksConditionals: true,
          checksVoidReturn: true,
          checksSpreads: true,
        },
      ],

      '@typescript-eslint/no-misused-spread': 'error',
      '@typescript-eslint/no-mixed-enums': 'error',

      '@typescript-eslint/no-namespace': [
        'error',
        {
          allowDeclarations: false,
          allowDefinitionFiles: false,
        },
      ],

      '@typescript-eslint/no-non-null-asserted-nullish-coalescing': 'error',
      '@typescript-eslint/no-non-null-asserted-optional-chain': 'error',
      '@typescript-eslint/no-non-null-assertion': 'error',

      '@typescript-eslint/no-redeclare': [
        'error',
        {
          builtinGlobals: true,
          ignoreDeclarationMerge: false,
        },
      ],

      '@typescript-eslint/no-redundant-type-constituents': 'error',
      '@typescript-eslint/no-require-imports': 'error',
      '@typescript-eslint/no-restricted-imports': ['error'],

      '@typescript-eslint/no-shadow': [
        'error',
        {
          builtinGlobals: false,
          hoist: 'functions',
          ignoreOnInitialization: false,
          ignoreTypeValueShadow: false,
          ignoreFunctionTypeParameterNameValueShadow: false,
        },
      ],

      '@typescript-eslint/no-this-alias': [
        'error',
        {
          allowDestructuring: false,
        },
      ],

      '@typescript-eslint/only-throw-error': [
        'error',
        {
          allowThrowingAny: false,
          allowThrowingUnknown: false,
        },
      ],

      '@typescript-eslint/no-type-alias': [
        'off',
        {
          allowAliases: 'never',
          allowCallbacks: 'never',
          allowConditionalTypes: 'never',
          allowConstructors: 'never',
          allowLiterals: 'never',
          allowMappedTypes: 'never',
          allowTupleTypes: 'never',
          allowGenerics: 'never',
        },
      ],

      '@typescript-eslint/no-unnecessary-boolean-literal-compare': [
        'error',
        {
          allowComparingNullableBooleansToTrue: false,
          allowComparingNullableBooleansToFalse: false,
        },
      ],

      '@typescript-eslint/no-unnecessary-condition': [
        'off',
        {
          allowConstantLoopConditions: false,
          allowRuleToRunWithoutStrictNullChecksIKnowWhatIAmDoing: false,
        },
      ],

      '@typescript-eslint/no-unnecessary-parameter-property-assignment': 'error',
      '@typescript-eslint/no-unnecessary-qualifier': 'error',
      '@typescript-eslint/no-unnecessary-template-expression': 'error',
      '@typescript-eslint/no-unnecessary-type-arguments': 'error',
      '@typescript-eslint/no-unnecessary-type-constraint': 'error',
      '@typescript-eslint/no-unnecessary-type-parameters': 'error',
      '@typescript-eslint/no-unsafe-argument': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',
      '@typescript-eslint/no-unsafe-declaration-merging': 'error',
      '@typescript-eslint/no-unsafe-enum-comparison': 'off',
      '@typescript-eslint/no-unsafe-function-type': 'error',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-unsafe-return': 'off',
      '@typescript-eslint/no-unsafe-type-assertion': 'off',
      '@typescript-eslint/no-unsafe-unary-minus': 'error',

      '@typescript-eslint/no-unused-expressions': [
        'error',
        {
          allowShortCircuit: false,
          allowTernary: false,
          allowTaggedTemplates: false,
          enforceForJSX: false,
        },
      ],

      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          vars: 'all',
          args: 'after-used',
          ignoreRestSiblings: false,
          caughtErrors: 'all',
        },
      ],

      '@typescript-eslint/no-use-before-define': [
        'error',
        {
          functions: true,
          classes: true,
          variables: true,
          enums: true,
          typedefs: true,
          ignoreTypeReferences: true,
        },
      ],

      '@typescript-eslint/no-useless-constructor': ['error'],
      '@typescript-eslint/no-useless-empty-export': 'error',
      '@typescript-eslint/no-wrapper-object-types': 'error',
      '@typescript-eslint/non-nullable-type-assertion-style': 'error',

      '@typescript-eslint/parameter-properties': [
        'error',
        {
          prefer: 'parameter-property',
        },
      ],

      '@typescript-eslint/prefer-as-const': 'error',

      '@typescript-eslint/prefer-destructuring': [
        'off',
        {
          array: true,
          object: true,
        },
        {
          enforceForRenamedProperties: false,
          enforceForDeclarationWithTypeAnnotation: false,
        },
      ],

      '@typescript-eslint/prefer-enum-initializers': 'error',
      '@typescript-eslint/prefer-find': 'error',
      '@typescript-eslint/prefer-for-of': 'error',
      '@typescript-eslint/prefer-function-type': 'error',
      '@typescript-eslint/prefer-includes': 'error',

      '@typescript-eslint/prefer-literal-enum-member': [
        'error',
        {
          allowBitwiseExpressions: false,
        },
      ],

      '@typescript-eslint/prefer-namespace-keyword': 'error',

      '@typescript-eslint/prefer-nullish-coalescing': [
        'off',
        {
          ignoreBooleanCoercion: false,
          ignoreTernaryTests: false,
          ignoreConditionalTests: true,
          ignoreMixedLogicalExpressions: false,

          ignorePrimitives: {
            bigint: false,
            boolean: false,
            number: false,
            string: false,
          },
        },
      ],

      '@typescript-eslint/prefer-optional-chain': 'error',

      '@typescript-eslint/prefer-promise-reject-errors': [
        'off',
        {
          allowEmptyReject: true,
          allowThrowingAny: false,
          allowThrowingUnknown: false,
        },
      ],

      '@typescript-eslint/prefer-readonly': [
        'off',
        {
          onlyInlineLambdas: true,
        },
      ],

      '@typescript-eslint/prefer-readonly-parameter-types': [
        'off',
        {
          checkParameterProperties: true,
          ignoreInferredTypes: true,
          treatMethodsAsReadonly: true,
        },
      ],

      '@typescript-eslint/prefer-reduce-type-parameter': 'error',
      '@typescript-eslint/prefer-return-this-type': 'error',

      '@typescript-eslint/prefer-string-starts-ends-with': [
        'error',
        {
          allowSingleElementEquality: 'always',
        },
      ],

      '@typescript-eslint/promise-function-async': [
        'off',
        {
          checkArrowFunctions: true,
          checkFunctionDeclarations: true,
          checkFunctionExpressions: true,
          checkMethodDeclarations: true,
        },
      ],

      '@typescript-eslint/require-array-sort-compare': [
        'error',
        {
          ignoreStringArrays: true,
        },
      ],

      '@typescript-eslint/require-await': 'error',

      '@typescript-eslint/restrict-plus-operands': [
        'error',
        {
          skipCompoundAssignments: false,
          allowAny: false,
          allowBoolean: false,
          allowNullish: false,
          allowNumberAndString: false,
          allowRegExp: false,
        },
      ],

      '@typescript-eslint/restrict-template-expressions': [
        'error',
        {
          allowNumber: true,
          allowBoolean: false,
          allowAny: true,
          allowArray: false,
          allowNullish: false,
          allowRegExp: false,
          allowNever: false,
        },
      ],

      '@typescript-eslint/return-await': ['error', 'in-try-catch'],

      '@typescript-eslint/sort-type-constituents': [
        'off',
        {
          checkIntersections: true,
          checkUnions: true,

          groupOrder: [
            'named',
            'keyword',
            'operator',
            'literal',
            'function',
            'import',
            'conditional',
            'object',
            'tuple',
            'intersection',
            'union',
            'nullish',
          ],
        },
      ],

      '@typescript-eslint/strict-boolean-expressions': [
        'off',
        {
          allowString: true,
          allowNumber: true,
          allowNullableObject: true,
          allowNullableBoolean: false,
          allowNullableString: false,
          allowNullableNumber: false,
          allowAny: false,
          allowRuleToRunWithoutStrictNullChecksIKnowWhatIAmDoing: false,
        },
      ],

      '@typescript-eslint/switch-exhaustiveness-check': [
        'error',
        {
          allowDefaultCaseForExhaustiveSwitch: true,
          considerDefaultExhaustiveForUnions: false,
          requireDefaultForNonUnion: false,
        },
      ],

      '@typescript-eslint/triple-slash-reference': [
        'error',
        {
          path: 'never',
          types: 'never',
          lib: 'never',
        },
      ],

      '@typescript-eslint/typedef': [
        'error',
        {
          arrowParameter: false,
          variableDeclaration: false,
          arrayDestructuring: false,
          memberVariableDeclaration: false,
          objectDestructuring: false,
          parameter: false,
          propertyDeclaration: true,
          variableDeclarationIgnoreFunction: false,
        },
      ],

      '@typescript-eslint/unbound-method': [
        'off',
        {
          ignoreStatic: false,
        },
      ],

      '@typescript-eslint/unified-signatures': [
        'error',
        {
          ignoreDifferentlyNamedParameters: false,
        },
      ],

      '@typescript-eslint/use-unknown-in-catch-callback-variable': 'off',

      'array-callback-return': [
        'error',
        {
          allowImplicit: false,
          checkForEach: true,
          allowVoid: true,
        },
      ],

      'constructor-super': 'error',
      'for-direction': 'error',
      'getter-return': 'error',
      'no-async-promise-executor': 'error',
      'no-await-in-loop': 'error',
      'no-class-assign': 'error',
      'no-compare-neg-zero': 'error',
      'no-cond-assign': 'error',
      'no-const-assign': 'error',
      'no-constant-binary-expression': 'error',
      'no-constant-condition': 'error',
      'no-constructor-return': 'error',
      'no-control-regex': 'error',
      'no-debugger': 'error',
      'no-dupe-args': 'error',
      'no-dupe-class-members': 'off',
      'no-dupe-else-if': 'error',
      'no-dupe-keys': 'error',
      'no-duplicate-case': 'error',
      'no-duplicate-imports': 'off',
      'no-empty-character-class': 'error',
      'no-empty-pattern': 'error',
      'no-ex-assign': 'error',
      'no-fallthrough': 'error',
      'no-func-assign': 'error',
      'no-import-assign': 'error',
      'no-inner-declarations': ['error', 'both'],

      'no-irregular-whitespace': [
        'error',
        {
          skipStrings: false,
          skipComments: false,
          skipRegExps: false,
          skipTemplates: false,
        },
      ],

      'no-loss-of-precision': 'error',

      'no-misleading-character-class': [
        'error',
        {
          allowEscape: true,
        },
      ],

      'no-new-symbol': 'error',
      'no-obj-calls': 'error',
      'no-promise-executor-return': 'error',
      'no-prototype-builtins': 'error',
      'no-self-assign': 'error',
      'no-self-compare': 'error',
      'no-setter-return': 'error',
      'no-sparse-arrays': 'error',
      'no-template-curly-in-string': 'error',
      'no-this-before-super': 'error',

      'no-undef': [
        'off',
        {
          typeof: false,
        },
      ],

      'no-unexpected-multiline': 'error',
      'no-unmodified-loop-condition': 'error',
      'no-unreachable': 'error',
      'no-unreachable-loop': 'error',
      'no-unsafe-finally': 'error',
      'no-unsafe-negation': 'error',
      'no-unsafe-optional-chaining': 'error',
      'no-unused-private-class-members': 'error',
      'no-unused-vars': 'off',
      'no-use-before-define': 'off',
      'no-useless-assignment': 'error',
      'no-useless-backreference': 'error',
      'require-atomic-updates': 'error',
      'use-isnan': 'error',

      'valid-typeof': [
        'error',
        {
          requireStringLiterals: true,
        },
      ],

      'accessor-pairs': [
        'off',
        {
          getWithoutSet: true,
          setWithoutGet: true,
          enforceForClassMembers: true,
        },
      ],

      'arrow-body-style': ['error', 'as-needed'],
      'block-scoped-var': 'error',

      camelcase: [
        'off',
        {
          properties: 'always',
          ignoreDestructuring: false,
          ignoreImports: false,
          ignoreGlobals: false,
        },
      ],

      'capitalized-comments': [
        'off',
        'never',
        {
          ignoreInlineComments: true,
          ignoreConsecutiveComments: false,
        },
      ],

      'class-methods-use-this': [
        'off',
        {
          enforceForClassFields: true,
        },
      ],

      complexity: [
        'off',
        {
          max: 2,
        },
      ],

      'consistent-return': [
        'off',
        {
          treatUndefinedAsUnspecified: true,
        },
      ],

      'consistent-this': ['error', 'this'],
      curly: ['error', 'multi-line'],
      'default-case': 'error',
      'default-case-last': 'error',
      'default-param-last': 'off',
      'dot-notation': 'off',
      eqeqeq: ['error', 'always'],
      'func-name-matching': ['error', 'always'],
      'func-names': ['error', 'never'],

      'func-style': [
        'error',
        'declaration',
        {
          allowArrowFunctions: true,
        },
      ],

      'grouped-accessor-pairs': ['off', 'anyOrder'],
      'guard-for-in': 'error',
      'id-denylist': ['error'],

      'id-length': [
        'off',
        {
          min: 1,
          properties: 'always',
        },
      ],

      'id-match': [
        'off',
        '^[a-z]+([A-Z][a-z]+)*$',
        {
          properties: false,
          classFields: false,
          onlyDeclarations: true,
          ignoreDestructuring: false,
        },
      ],

      'init-declarations': 'off',
      'logical-assignment-operators': ['error', 'always'],

      'max-classes-per-file': [
        'error',
        {
          max: 1,
          ignoreExpressions: false,
        },
      ],

      'max-depth': [
        'error',
        {
          max: 5,
        },
      ],

      'max-lines': [
        'error',
        {
          max: 300,
          skipBlankLines: false,
          skipComments: false,
        },
      ],

      'max-lines-per-function': [
        'off',
        {
          max: 50,
          skipBlankLines: false,
          skipComments: false,
          IIFEs: false,
        },
      ],

      'max-nested-callbacks': [
        'off',
        {
          max: 3,
        },
      ],

      'max-params': [
        'off',
        {
          max: 3,
        },
      ],

      'max-statements': [
        'off',
        {
          max: 10,
          ignoreTopLevelFunctions: true,
        },
      ],

      'new-cap': [
        'off',
        {
          newIsCap: true,
          capIsNew: true,
          properties: true,
        },
      ],

      'no-alert': 'error',
      'no-array-constructor': 'off',

      'no-bitwise': [
        'error',
        {
          int32Hint: true,
        },
      ],

      'no-caller': 'error',
      'no-case-declarations': 'error',
      'no-console': 'error',
      'no-continue': 'off',
      'no-delete-var': 'error',
      'no-div-regex': 'error',

      'no-else-return': [
        'error',
        {
          allowElseIf: false,
        },
      ],

      'no-empty': [
        'error',
        {
          allowEmptyCatch: false,
        },
      ],

      'no-empty-function': 'off',
      'no-eq-null': 'error',

      'no-eval': [
        'error',
        {
          allowIndirect: false,
        },
      ],

      'no-extend-native': 'error',
      'no-extra-bind': 'error',

      'no-extra-boolean-cast': [
        'error',
        {
          enforceForInnerExpressions: true,
        },
      ],

      'no-extra-label': 'error',
      'no-global-assign': ['error'],

      'no-implicit-coercion': [
        'error',
        {
          boolean: true,
          number: true,
          string: true,
          disallowTemplateShorthand: true,
        },
      ],

      'no-implicit-globals': [
        'error',
        {
          lexicalBindings: true,
        },
      ],

      'no-implied-eval': 'off',
      'no-inline-comments': 'off',
      'no-invalid-this': 'off',
      'no-iterator': 'error',
      'no-label-var': 'error',

      'no-labels': [
        'error',
        {
          allowLoop: false,
          allowSwitch: false,
        },
      ],

      'no-lone-blocks': 'error',
      'no-lonely-if': 'error',
      'no-loop-func': 'off',
      'no-magic-numbers': 'off',
      'no-multi-assign': 'error',
      'no-multi-str': 'error',
      'no-negated-condition': 'error',
      'no-nested-ternary': 'error',
      'no-new': 'error',
      'no-new-func': 'error',
      'no-new-wrappers': 'error',
      'no-nonoctal-decimal-escape': 'error',
      'no-object-constructor': 'error',
      'no-octal': 'error',
      'no-octal-escape': 'error',

      'no-param-reassign': [
        'off',
        {
          props: true,
        },
      ],

      'no-plusplus': [
        'error',
        {
          allowForLoopAfterthoughts: true,
        },
      ],

      'no-proto': 'error',
      'no-redeclare': 'off',
      'no-regex-spaces': 'error',
      'no-restricted-exports': ['error'],
      'no-restricted-globals': ['error'],
      'no-restricted-imports': 'off',
      'no-restricted-properties': ['error'],
      'no-restricted-syntax': ['error'],
      'no-return-assign': ['error', 'always'],
      'no-return-await': 'off',
      'no-script-url': 'error',
      'no-sequences': 'error',
      'no-shadow': 'off',
      'no-shadow-restricted-names': 'error',
      'no-ternary': 'off',
      'no-throw-literal': 'off',
      'no-undef-init': 'error',
      'no-undefined': 'off',
      'no-underscore-dangle': 'off',
      'no-unneeded-ternary': 'error',
      'no-unused-expressions': 'off',
      'no-unused-labels': 'error',
      'no-useless-call': 'error',
      'no-useless-catch': 'error',

      'no-useless-computed-key': [
        'error',
        {
          enforceForClassMembers: true,
        },
      ],

      'no-useless-concat': 'error',
      'no-useless-constructor': 'off',

      'no-useless-rename': [
        'error',
        {
          ignoreImport: false,
          ignoreExport: false,
          ignoreDestructuring: false,
        },
      ],

      'no-useless-return': 'error',
      'no-var': 'error',

      'no-void': [
        'off',
        {
          allowAsStatement: false,
        },
      ],

      'no-warning-comments': [
        'off',
        {
          terms: ['todo', 'fixme', 'any other term'],
          location: 'anywhere',
        },
      ],

      'no-with': 'error',

      'object-shorthand': [
        'error',
        'always',
        {
          avoidQuotes: true,
          ignoreConstructors: true,
          avoidExplicitReturnArrows: true,
        },
      ],

      'one-var': ['error', 'never'],
      'operator-assignment': ['error', 'always'],
      'prefer-arrow-callback': 'error',
      'prefer-const': 'error',

      'prefer-destructuring': [
        'off',
        {
          array: true,
          object: true,
        },
        {
          enforceForRenamedProperties: false,
        },
      ],

      'prefer-exponentiation-operator': 'error',
      'prefer-numeric-literals': 'error',
      'prefer-object-has-own': 'error',
      'prefer-object-spread': 'error',

      'prefer-promise-reject-errors': [
        'off',
        {
          allowEmptyReject: true,
        },
      ],

      'prefer-regex-literals': [
        'error',
        {
          disallowRedundantWrapping: true,
        },
      ],

      'prefer-rest-params': 'error',
      'prefer-spread': 'error',
      'prefer-template': 'error',
      radix: ['error', 'as-needed'],
      'require-await': 'off',
      'require-unicode-regexp': 'off',
      'require-yield': 'error',
      'sort-imports': ['off'],

      'sort-keys': [
        'off',
        'asc',
        {
          caseSensitive: true,
          natural: false,
          minKeys: 2,
        },
      ],

      'sort-vars': [
        'error',
        {
          ignoreCase: true,
        },
      ],

      strict: ['error', 'global'],
      'symbol-description': 'error',
      'vars-on-top': 'error',
      yoda: ['error', 'never'],
      'unicode-bom': ['error', 'never'],
    },

    processor: '@angular-eslint/template/extract-inline-html',
  },
  {
    files: ['**/*.html'],

    plugins: {
      '@angular-eslint/template': angularEslintTemplate,
      prettier: prettierPlugin,
    },

    languageOptions: {
      parser: parser,
    },

    rules: {
      '@angular-eslint/template/attributes-order': [
        'off',
        {
          alphabetical: false,

          order: [
            'STRUCTURAL_DIRECTIVE',
            'TEMPLATE_REFERENCE',
            'ATTRIBUTE_BINDING',
            'INPUT_BINDING',
            'TWO_WAY_BINDING',
            'OUTPUT_BINDING',
          ],
        },
      ],

      '@angular-eslint/template/banana-in-box': 'error',
      '@angular-eslint/template/button-has-type': 'error',
      '@angular-eslint/template/click-events-have-key-events': 'off',

      '@angular-eslint/template/conditional-complexity': [
        'off',
        {
          maxComplexity: 5,
        },
      ],

      '@angular-eslint/template/cyclomatic-complexity': [
        'off',
        {
          maxComplexity: 5,
        },
      ],

      '@angular-eslint/template/eqeqeq': [
        'error',
        {
          allowNullOrUndefined: false,
        },
      ],

      '@angular-eslint/template/i18n': [
        'off',
        {
          checkAttributes: true,
          checkId: true,
          checkText: true,
          checkDuplicateId: true,
          requireDescription: true,
        },
      ],

      '@angular-eslint/template/mouse-events-have-key-events': 'error',
      '@angular-eslint/template/no-any': 'error',
      '@angular-eslint/template/no-autofocus': 'error',
      '@angular-eslint/template/no-call-expression': 'off',
      '@angular-eslint/template/no-distracting-elements': 'error',

      '@angular-eslint/template/no-duplicate-attributes': [
        'error',
        {
          allowTwoWayDataBinding: false,
        },
      ],

      '@angular-eslint/template/no-inline-styles': [
        'off',
        {
          allowNgStyle: true,
          allowBindToStyle: true,
        },
      ],

      '@angular-eslint/template/no-interpolation-in-attributes': 'error',
      '@angular-eslint/template/no-negated-async': 'error',
      '@angular-eslint/template/no-positive-tabindex': 'error',
      '@angular-eslint/template/prefer-control-flow': 'error',
      '@angular-eslint/template/use-track-by-function': 'off',
      '@angular-eslint/template/alt-text': 'error',
      '@angular-eslint/template/elements-content': 'off',
      '@angular-eslint/template/interactive-supports-focus': 'off',
      '@angular-eslint/template/label-has-associated-control': ['off'],
      '@angular-eslint/template/role-has-required-aria': 'error',
      '@angular-eslint/template/table-scope': 'error',
      '@angular-eslint/template/valid-aria': 'error',
    },
  },
]);
