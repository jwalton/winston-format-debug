import { expect } from 'chai';
import 'mocha';
import * as path from 'path';
import sinon from 'sinon';
import { LEVEL, MESSAGE, configs } from 'triple-beam';
import { DebugFormatOptions, default as debugFormat } from '../src';
import { dateToString } from '../src/utils';

const DEFAULT_OPTIONS : DebugFormatOptions = {
    processName: 'test',
    colors: false
};

function doTransform(info: any, options: DebugFormatOptions={}) {
    const formatOptions = Object.assign({}, DEFAULT_OPTIONS, options);
    const format = debugFormat(options);
    info[LEVEL] = info.level;
    info[MESSAGE] = info.message;
    const result = format.transform(info, formatOptions);
    return result[MESSAGE];
}

describe('DebugFormat', function() {
    beforeEach(function() {
        const sandbox = this.sandbox = sinon.createSandbox();
        this.dateSpy = sandbox.spy(global, 'Date');
        this.date = () => dateToString(this.dateSpy.returnValues[0]);
    });

    afterEach(function() {
        this.sandbox.restore();
    });

    it('should format a simple message', function() {
        const result = doTransform({
            level: 'info',
            message: 'Hello world!'
        });

        expect(result).to.equal(
            `${this.date()} test[${process.pid}] INFO:    Hello world!`
        );
    });

    it('should format a message with some extra fields', function() {
        const result = doTransform({
            level: 'info',
            message: 'Hello world!',
            account: {name: 'foo'}
        });

        expect(result).to.equal(
            `${this.date()} test[${process.pid}] INFO:    Hello world!\n` +
            '    account: {"name":"foo"}'
        );
    });

    it('should exclude extra fields with value undefined or null ', function() {
        const result = doTransform({
            level: 'info',
            message: 'Hello world!',
            zero: 0,
            not_true: false,
            exclude_this: undefined,
            exclude_this_too: null,
        });

        expect(result).to.equal(
            `${this.date()} test[${process.pid}] INFO:    Hello world!\n` +
            '    zero: 0\n' +
            '    not_true: false'
        );
    });

    it('should make errors pretty', function() {
        const result = doTransform({
            level: 'info',
            message: 'Hello world!',
            err: new Error('boom')
        }, {
            maxExceptionLines: 0,
            basePath: path.resolve(__dirname, '..')
        });

        expect(result).to.equal(
            `${this.date()} test[${process.pid}] INFO:    Hello world!\n` +
            '    err: Error: boom\n' +
            '        [truncated]'
        );
    });

    it('should allow custom levels', function() {
        const result = doTransform({
            level: 'foo',
            message: 'Hello world!'
        }, {
            levels: {
                foo: 0,
                bar: 1
            }
        });

        expect(result).to.equal(
            `${this.date()} test[${process.pid}] FOO: Hello world!`
        );
    });

    it('should colorize a message', function() {
        const result = doTransform({
            level: 'info',
            message: 'Hello world!',
            account: {name: 'foo'}
        }, {
            levels: configs.syslog.levels,
            colors: configs.syslog.colors,
            colorizePrefix: true,
            colorizeMessage: true,
            colorizeValues: true
        });

        expect(result).to.equal(
            `\u001b[32m${this.date()} test[${process.pid}] INFO:   \u001b[39m ` +
            '\u001b[32mHello world!\u001b[39m\n' +
            '\u001b[32m    account: {"name":"foo"}\u001b[39m'
        );
    });

    it('should truncate long value strings', function() {
        const terminalWidth = process.stdout.columns || 80;
        let longValue = 'start';
        while(longValue.length < terminalWidth) { longValue += '-'; }
        longValue += 'end';

        const result = doTransform({
            level: 'info',
            message: 'Hello',
            longValue
        });

        let expected = '    longValue: "start';
        while(expected.length < terminalWidth - 3) { expected += '-'; }
        expected += '...';

        expect(result).to.equal(
            `${this.date()} test[${process.pid}] INFO:    Hello\n` + expected
        );

    });

    it('should truncate long value strings with specified terminalWidth', function() {
        const terminalWidth = 70;
        let longValue = 'start';
        while(longValue.length < terminalWidth) { longValue += '-'; }
        longValue += 'end';

        const result = doTransform({
            level: 'info',
            message: 'Hello',
            longValue
        }, {terminalWidth});

        expect(result).to.equal(
            `${this.date()} test[${process.pid}] INFO:    Hello\n` +
            '    longValue: "start----------------------------------------------...');

    });

});
