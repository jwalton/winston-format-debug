module.exports = {
    // Transforms tell jest how to process our non-javascript files.
    // Here we're using babel for .js and .jsx files, and ts-jest for
    // .ts and .tsx files.  You *can* just use babel-jest for both, if
    // you already have babel set up to compile typescript files.
    transform: {
        '^.+\\.tsx?$': 'ts-jest',
    },
    // Tells Jest what folders to ignore for tests
    testPathIgnorePatterns: [`node_modules`, `\\.cache`],
    testMatch: ['**/test/**/*Test.ts'],
};
