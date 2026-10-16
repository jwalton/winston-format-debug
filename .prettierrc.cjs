module.exports = {
    endOfLine: 'lf',
    printWidth: 100,
    trailingComma: 'es5',
    tabWidth: 4,
    semi: true,
    singleQuote: true,
    overrides: [
        {
            files: '*.md',
            options: {
                tabWidth: 2,
            },
        },
        {
            files: '*.yaml',
            options: {
                tabWidth: 2,
            },
        },
    ],
};
