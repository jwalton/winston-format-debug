import chai from 'chai';
import chalk from 'chalk';
import { formatException } from '../src/exceptionUtils';

const { expect } = chai;

const STACK = `Error: Error message
    at Foo.bar [as eval] (/Users/jwalton/dev/project/index.js:432:12)
    at doTheThing (/Users/jwalton/dev/project/boom.js:432:12)
    at doTheOtherThing (/Users/jwalton/dev/project/fish.js:1:1)
    at REPLServer.emit (events.js:412:35)
    at REPLServer.emit (domain.js:475:12)
    at REPLServer.Interface._onLine (readline.js:434:10)
    at REPLServer.Interface._line (readline.js:791:8)`;

describe('exception formatting', () => {
    it('should format an exception', () => {
        const formatted = formatException(STACK, { color: false });
        expect(formatted).to.equal(STACK);
    });

    it('should make own lines bold', () => {
        const formatted = formatException(STACK, { basePath: '/Users/jwalton/dev/project' });
        expect(formatted).to.equal(
            `Error: Error message\n` +
                chalk.bold(`    at Foo.bar [as eval] (./index.js:432:12)`) +
                '\n' +
                chalk.bold(`    at doTheThing (./boom.js:432:12)`) +
                '\n' +
                chalk.bold(`    at doTheOtherThing (./fish.js:1:1)`) +
                '\n' +
                `    at REPLServer.emit (events.js:412:35)
    at REPLServer.emit (domain.js:475:12)
    at REPLServer.Interface._onLine (readline.js:434:10)
    at REPLServer.Interface._line (readline.js:791:8)`
        );
    });

    it('should work on a non-exception', () => {
        const formatted = formatException('foo', {});
        expect(formatted).to.equal('foo');
    });

    it('should work on an exception with unexpected lines in the middle', () => {
        const stack = `Error: Error message
        at Foo.bar [as eval] (/Users/jwalton/dev/project/index.js:432:12)
        whatisthis?
        at doTheOtherThing (/Users/jwalton/dev/project/fish.js:1:1)`;

        const formatted = formatException(stack, {});
        expect(formatted).to.equal(stack);
    });

    it('should truncate to a set number of lines', () => {
        const formatted = formatException(STACK, { maxLines: 5 });
        expect(formatted).to.equal(`Error: Error message
    at Foo.bar [as eval] (/Users/jwalton/dev/project/index.js:432:12)
    at doTheThing (/Users/jwalton/dev/project/boom.js:432:12)
    at doTheOtherThing (/Users/jwalton/dev/project/fish.js:1:1)
    at REPLServer.emit (events.js:412:35)
    at REPLServer.emit (domain.js:475:12)
    [truncated]`);
    });

    it('should truncate to "own" code', () => {
        const formatted = formatException(STACK, {
            maxLines: 'auto',
            basePath: '/Users/jwalton/dev/project',
        });
        expect(formatted).to.equal(
            `Error: Error message\n` +
                chalk.bold(`    at Foo.bar [as eval] (./index.js:432:12)`) +
                '\n' +
                chalk.bold(`    at doTheThing (./boom.js:432:12)`) +
                '\n' +
                chalk.bold(`    at doTheOtherThing (./fish.js:1:1)`) +
                '\n' +
                '    [truncated]'
        );
    });

    it('should do something sensible when there is no"own" code', () => {
        const formatted = formatException(STACK, {
            maxLines: 'auto',
            basePath: '/foo/baz/qux',
        });
        expect(formatted).to.equal(
            `Error: Error message
    at Foo.bar [as eval] (/Users/jwalton/dev/project/index.js:432:12)
    at doTheThing (/Users/jwalton/dev/project/boom.js:432:12)
    at doTheOtherThing (/Users/jwalton/dev/project/fish.js:1:1)
    at REPLServer.emit (events.js:412:35)
    at REPLServer.emit (domain.js:475:12)
    [truncated]`
        );
    });
});
