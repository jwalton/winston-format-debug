import { expect } from 'chai';
import chalk from 'chalk';
import * as path from 'path';
import { configs, LEVEL, MESSAGE } from 'triple-beam';
import { DebugFormatOptions, default as debugFormat } from '../src';
import { dateToString } from '../src/utils';

const NOW = 1635964932940;

const DEFAULT_OPTIONS: DebugFormatOptions = {
    processName: 'test',
    colors: false,
};

function doTransform(info: any, options: DebugFormatOptions = {}) {
    const formatOptions = Object.assign({}, DEFAULT_OPTIONS, options);
    const format = debugFormat(options);
    info[LEVEL] = info.level;
    info[MESSAGE] = info.message;
    const result = format.transform(info, formatOptions);
    return result[MESSAGE];
}

describe('DebugFormat', function () {
    const defaultChalk = chalk.level;

    const date = dateToString(new Date(NOW));

    beforeEach(function () {
        jest.useFakeTimers();
        jest.setSystemTime(new Date(1635964932940));
        chalk.level = 3;
    });

    afterEach(function () {
        chalk.level = defaultChalk;
    });

    it('should format a simple message', function () {
        const result = doTransform({
            level: 'info',
            message: 'Hello world!',
        });

        expect(result).to.equal(`${date} test[${process.pid}] INFO:    Hello world!`);
    });

    it('should format a message with some extra fields', function () {
        const result = doTransform({
            level: 'info',
            message: 'Hello world!',
            account: { name: 'foo' },
        });

        expect(result).to.equal(
            `${date} test[${process.pid}] INFO:    Hello world!\n` + '    account: {"name":"foo"}'
        );
    });

    it('should skip extra fields', function () {
        const result = doTransform(
            {
                level: 'info',
                message: 'Hello world!',
                account: { name: 'foo' },
                banana: 'joe',
            },
            { skip: ['account'] }
        );

        expect(result).to.equal(
            `${date} test[${process.pid}] INFO:    Hello world!\n` + '    banana: "joe"'
        );
    });

    it('should skip extra fields with a function', function () {
        const result = doTransform(
            {
                level: 'info',
                message: 'Hello world!',
                account: { name: 'foo' },
                banana: 'joe',
            },
            { skip: (key) => key === 'account' }
        );

        expect(result).to.equal(
            `${date} test[${process.pid}] INFO:    Hello world!\n` + '    banana: "joe"'
        );
    });

    it('should exclude extra fields with value undefined or null ', function () {
        const result = doTransform({
            level: 'info',
            message: 'Hello world!',
            zero: 0,
            not_true: false,
            exclude_this: undefined,
            exclude_this_too: null,
        });

        expect(result).to.equal(
            `${date} test[${process.pid}] INFO:    Hello world!\n` +
                '    zero: 0\n' +
                '    not_true: false'
        );
    });

    it('should make errors pretty', function () {
        const result = doTransform(
            {
                level: 'info',
                message: 'Hello world!',
                err: new Error('boom'),
            },
            {
                maxExceptionLines: 0,
                basePath: path.resolve(__dirname, '..'),
            }
        );

        expect(result).to.equal(
            `${date} test[${process.pid}] INFO:    Hello world!\n` +
                '    err: Error: boom\n' +
                '        [truncated]'
        );
    });

    it('should allow custom levels', function () {
        const result = doTransform(
            {
                level: 'foo',
                message: 'Hello world!',
            },
            {
                levels: {
                    foo: 0,
                    bar: 1,
                },
            }
        );

        expect(result).to.equal(`${date} test[${process.pid}] FOO: Hello world!`);
    });

    it('should colorize a message', function () {
        const result = doTransform(
            {
                level: 'info',
                message: 'Hello world!',
                account: { name: 'foo' },
            },
            {
                levels: configs.syslog.levels,
                colors: configs.syslog.colors,
                colorizePrefix: true,
                colorizeMessage: true,
                colorizeValues: true,
            }
        );

        expect(result).to.equal(
            `\u001b[32m${date} test[${process.pid}] INFO:   \u001b[39m ` +
                '\u001b[32mHello world!\u001b[39m\n' +
                '\u001b[32m    account: {"name":"foo"}\u001b[39m'
        );
    });

    it('should colorize a message with a hex code', function () {
        const result = doTransform(
            {
                level: 'info',
                message: 'Hello world!',
                account: { name: 'foo' },
            },
            {
                levels: configs.syslog.levels,
                colors: { info: '#aa00ff' },
                colorizePrefix: true,
                colorizeMessage: true,
                colorizeValues: true,
            }
        );

        expect(result).to.equal(
            `\u001b[38;2;170;0;255m${date} test[${process.pid}] INFO:   \u001b[39m ` +
                `\u001b[38;2;170;0;255mHello world!\u001b[39m\n` +
                `\u001b[38;2;170;0;255m    account: {"name":"foo"}\u001b[39m`
        );
    });

    it('should colorize a message with a Winston code', function () {
        const result = doTransform(
            {
                level: 'info',
                message: 'Hello world!',
                account: { name: 'foo' },
            },
            {
                levels: configs.syslog.levels,
                colors: { info: 'cyanBG' },
                colorizePrefix: true,
                colorizeMessage: true,
                colorizeValues: true,
            }
        );

        expect(result).to.equal(
            `\u001b[46m${date} test[${process.pid}] INFO:   \u001b[49m ` +
                `\u001b[46mHello world!\u001b[49m\n` +
                `\u001b[46m    account: {"name":"foo"}\u001b[49m`
        );
    });

    it('should truncate long value strings', function () {
        const terminalWidth = process.stdout.columns || 80;
        let longValue = 'start';
        while (longValue.length < terminalWidth) {
            longValue += '-';
        }
        longValue += 'end';

        const result = doTransform({
            level: 'info',
            message: 'Hello',
            longValue,
        });

        let expected = '    longValue: "start';
        while (expected.length < terminalWidth - 3) {
            expected += '-';
        }
        expected += '...';

        expect(result).to.equal(`${date} test[${process.pid}] INFO:    Hello\n` + expected);
    });

    it('should truncate long value strings with specified terminalWidth', function () {
        const terminalWidth = 70;
        let longValue = 'start';
        while (longValue.length < terminalWidth) {
            longValue += '-';
        }
        longValue += 'end';

        const result = doTransform(
            {
                level: 'info',
                message: 'Hello',
                longValue,
            },
            { terminalWidth }
        );

        expect(result).to.equal(
            `${date} test[${process.pid}] INFO:    Hello\n` +
                '    longValue: "start----------------------------------------------...'
        );
    });

    it('should hide process name', function () {
        const result = doTransform(
            {
                level: 'info',
                message: 'Hello world!',
                account: { name: 'foo' },
                banana: 'joe',
            },
            { processName: '', skip: ['account'] }
        );

        expect(result).to.equal(
            `${date} [${process.pid}] INFO:    Hello world!\n` + '    banana: "joe"'
        );
    });

    it('should hide PID', function () {
        const result = doTransform(
            {
                level: 'info',
                message: 'Hello world!',
                account: { name: 'foo' },
                banana: 'joe',
            },
            { showPID: false, skip: ['account'] }
        );

        expect(result).to.equal(`${date} test INFO:    Hello world!\n` + '    banana: "joe"');
    });

    it('should hide PID and process name', function () {
        const result = doTransform(
            {
                level: 'info',
                message: 'Hello world!',
                account: { name: 'foo' },
                banana: 'joe',
            },
            { processName: '', showPID: false, skip: ['account'] }
        );

        expect(result).to.equal(`${date} INFO:    Hello world!\n` + '    banana: "joe"');
    });
});
