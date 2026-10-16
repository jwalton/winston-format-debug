export default {
    // Transforms tell jest how to process our non-javascript files.
    // Here we're using ts-jest for .ts and .tsx files, compiled as ES modules.
    extensionsToTreatAsEsm: ['.ts'],
    transform: {
        '^.+\\.tsx?$': ['ts-jest', { useESM: true, tsconfig: 'test/tsconfig.json' }],
    },
    // Map relative `.js` imports back to their `.ts` sources.
    moduleNameMapper: {
        '^(\\.{1,2}/.*)\\.js$': '$1',
    },
    // Tells Jest what folders to ignore for tests
    testPathIgnorePatterns: [`node_modules`, `\\.cache`],
    testMatch: ['**/test/**/*Test.ts'],
};
