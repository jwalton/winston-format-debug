import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';

export default [
    // Only lint files in `src` and `test`.
    { ignores: ['*', '!src/', '!test/'] },
    eslint.configs.recommended,
    ...tseslint.configs.recommended,
];
