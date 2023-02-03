/* eslint-env node */
module.exports = {
    root: true,
    plugins: ['import'],
    extends: [
        'plugin:vue/vue3-recommended',
        'eslint:recommended'
    ],
    parserOptions: {
        ecmaVersion: 'latest'
    },
    ignorePatterns: ['**/node_modules/**'],
    rules: {
        'no-console': process.env.NODE_ENV === 'production' ? 'error' : 'off',
        'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off',
        indent: ['error', 4, { SwitchCase: 1 }], // 4 spaces
        'vue/html-indent': ['error', 4 ],
        'semi': ['error', 'never'],
        'import/extensions': ['error', 'always'],
        'vue/component-tags-order': 'off',
        'vue/custom-event-name-casing': 'off',
        'vue/no-template-shadow': 'off',
        'vue/multi-word-component-names': 'off',
        'vue/no-setup-props-destructure': 'off', // not needed because of "reactivity transform"
        'func-call-spacing': ['error', 'never'],
        'space-before-function-paren': ['error', 'always']
    },
    // temporary fix for "reactivity transform" makros
    globals: {
        $: 'readonly',
        $$: 'readonly',
        $ref: 'readonly',
        $computed: 'readonly',
        $shallowRef: 'readonly',
        $customRef: 'readonly',
        $toRef: 'readonly'
    }
}
