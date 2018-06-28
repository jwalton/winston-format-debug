import { expect } from 'chai';
import 'mocha';
import * as path from 'path';
import sinon from 'sinon';
import { LEVEL, MESSAGE } from 'triple-beam';
import { DebugFormatOptions, default as DebugFormat } from '../src';
import { dateToString } from '../src/utils';

const DEFAULT_OPTIONS : DebugFormatOptions = {
    processName: 'test'
};

function doTransform(info: any, options?: DebugFormatOptions) {
    const format = new DebugFormat(options);
    info[LEVEL] = info.level;
    info[MESSAGE] = info.message;
    const result = format.transform(info, options || DEFAULT_OPTIONS);
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
            `${this.date()} test[${process.pid}] INFO:   Hello world!`
        );
    });

    it('should format a message with some extra fields', function() {
        const result = doTransform({
            level: 'info',
            message: 'Hello world!',
            account: {name: 'foo'}
        });

        expect(result).to.equal(
            `${this.date()} test[${process.pid}] INFO:   Hello world!\n` +
            '    account: {"name":"foo"}'
        );
    });

    it('should make errors pretty', function() {
        const result = doTransform({
            level: 'info',
            message: 'Hello world!',
            err: new Error('boom')
        }, {
            processName: 'test',
            maxExceptionLines: 0,
            basePath: path.resolve(__dirname, '..')
        });

        expect(result).to.equal(
            `${this.date()} test[${process.pid}] INFO:   Hello world!\n` +
            '    err: Error: boom\n' +
            '        [truncated]'
        );
    });

    it('should allow custom levels', function() {
        const result = doTransform({
            level: 'foo',
            message: 'Hello world!'
        }, {
            processName: 'test',
            levels: {
                foo: 0,
                bar: 1
            }
        });

        expect(result).to.equal(
            `${this.date()} test[${process.pid}] FOO: Hello world!`
        );
    });

    describe.skip('stringifiers', function() {
        it('should use a stringifier to rewrite a field', function() {
            const result = doTransform({
                level: 'info',
                message: 'Hello world!',
                account: {name: 'foo'},
            }, {
                processName: 'test',
                stringifiers: {
                    'account': acc => acc.name
                }
            });

            expect(result).to.equal(
                `${this.date()} test[${process.pid}] INFO:   [foo] Hello world!\n` +
                `    account: foo`
            );
        });

        it('should use a stringifier to consume multiple fields', function() {
            const result = doTransform({
                level: 'info',
                message: 'Hello world!',
                account: {name: 'foo'},
            }, {
                processName: 'test',
                stringifiers: {
                    'account': acc => acc.name
                }
            });

            expect(result).to.equal(
                `${this.date()} test[${process.pid}] INFO:   [foo] Hello world!\n` +
                `    account: foo`
            );
        });
    });

    describe('prefixers', function() {
        it('should use a prefixer to handle short fields', function() {
            const result = doTransform({
                level: 'info',
                message: 'Hello world!',
                account: {name: 'foo'},
            }, {
                processName: 'test',
                prefixers: {
                    'account': acc => acc.name
                }
            });

            expect(result).to.equal(
                `${this.date()} test[${process.pid}] INFO:   [foo] Hello world!`
            );
        });

        it('should allow a prefixer to consume multiple fields', function() {
            const result = doTransform({
                level: 'info',
                message: 'Hello world!',
                foo: 'bar',
                baz: 'qux'
            }, {
                processName: 'test',
                prefixers: {
                    foo: (_foo, {info}) => ({
                        value: info.baz,
                        consumed: ['foo', 'baz']
                    })
                }
            });

            expect(result).to.equal(
                `${this.date()} test[${process.pid}] INFO:   [qux] Hello world!`
            );
        });

        it('should omit fields the prefixer returns null for', function() {
            const result = doTransform({
                level: 'info',
                message: 'Hello world!',
                account: {name: 'foo'},
            }, {
                processName: 'test',
                prefixers: {
                    'account': () => null
                }
            });

            expect(result).to.equal(
                `${this.date()} test[${process.pid}] INFO:   Hello world!`
            );
        });
    });
});
