import * as path from 'path';
import { dateToString, rpad } from './utils';
import { LEVEL, MESSAGE, configs } from 'triple-beam';
import exceptionFormatter from 'exception-formatter';

const INDENT = '    ';

export type Stringifier = (
    value: any,
    context: {
        info: any;
        useColor: boolean;
    }
) => string | null | {
    consumed?: string[];
    value: string;
};

export interface Stringifiers {
    [field: string]: Stringifier;
}

export interface DebugFormatOptions {
    levels?: {[name: string]: number};
    processName?: string;
    stringifiers?: Stringifiers;
    prefixers?: Stringifiers;
    useColor?: boolean;
    basePath?: string;
    maxExceptionLines?: number;
}

/**
 * Debug formatter intended for logging to console.  This is roughly a port
 * of bunyan-debug-stream.
 */
export default class DebugFormat {
    options: DebugFormatOptions;
    private readonly _processName: string;
    private readonly _maxLevelLength: number;
    private readonly _basepath: string;

    constructor(options: DebugFormatOptions = {}) {
        this.options = options;

        const scriptName = process.argv[1] || process.argv[0];
        this._processName = scriptName
            ? path.basename(scriptName, path.extname(scriptName))
            : '';

        const levels = options.levels || configs.npm;
        const levelNames = Object.keys(levels);
        this._maxLevelLength = Math.max.apply(Math, levelNames.map(s => s.length));

        this._basepath = process.cwd();
    }

    private _runStringifier(
        stringifier: Stringifier,
        consumed: {[key: string]: boolean},
        info: any,
        field: string,
        options: DebugFormatOptions
    ) {
        const result = stringifier(info[field], {info, useColor: !!options.useColor});

        consumed[field] = true;

        if(typeof(result) === 'string') {
            return result;
        } else if(result === null || result === undefined) {
            return null;
        } else {
            if(result.consumed) {
                for(const consumedField of result.consumed) {
                    consumed[consumedField] = true;
                }
            }
            return result.value;
        }
    }

    private _getStringifiedValues(
        consumed: {[key: string]: boolean},
        info: any,
        options: DebugFormatOptions
    ) : string[] {
        if(!options.stringifiers) {
            return [];
        }

        const stringifiers = options.stringifiers || {};
        const values = [];
        for(const field of Object.keys(stringifiers)) {
            const value = this._runStringifier(stringifiers[field], consumed, info, field, options);
            if(value) {
                values.push(`${INDENT}${field}: ${value}`);
            }
        }

        return values;
    }

    private _getPrefixes(
        consumed: {[key: string]: boolean},
        info: any,
        options: DebugFormatOptions
    ) : string[] {
        if(!options.prefixers) {
            return [];
        }

        const prefixers = options.prefixers;
        const prefixes = [];
        for(const field of Object.keys(prefixers)) {
            const prefix = this._runStringifier(prefixers[field], consumed, info, field, options);
            if(prefix) {
                prefixes.push(prefix);
            }
        }

        return prefixes;
    }

    _formatError(err: Error, options: DebugFormatOptions) : string {
        const formatOptions = {
            format: options.useColor ? 'ansi' : 'ascii',
            colors: false,
            basepath: options.basePath || this._basepath,
            maxLines: options.maxExceptionLines
        };

        const formatted = exceptionFormatter(err, formatOptions);

        return formatted.split('\n').join(`\n${INDENT}`);
    }

    transform(info: any, options: DebugFormatOptions) {
        const date = dateToString(new Date());
        const level = rpad(`${((info[LEVEL] || info.level) as string).toUpperCase()}:`, this._maxLevelLength + 1);
        const pid = process.pid;

        // Map of which fields we've used.
        const consumed : {[field: string]: boolean} = {level: true, message: true};

        // Handle stringifiers
        // TODO: Is there any point to stringifiers?  Caller can just use another format to clean up fields.
        const values = this._getStringifiedValues(consumed, info, options);

        // Handle prefixers
        const prefixes = this._getPrefixes(consumed, info, options);
        const prefixString = prefixes.length > 0
            ? `[${prefixes.join(', ')}] `
            : '';

        // Use JSON.stringify on whatever is left
        for(const key of Object.keys(info)) {
            // Skip fields we don't care about
            if (consumed[key]) {
                continue;
            }

            const value = info[key];
            if(value instanceof Error) {
                values.push(`${INDENT}${key}: ${this._formatError(value, options)}`);
            } else {
                const valueString = value && JSON.stringify(value);
                if(valueString) {
                    // Make sure value isn't too long.
                    const cols = process.stdout.columns;
                    let line = `${INDENT}${key}: ${valueString}`;
                    if(cols && line.length >= cols) {
                        line = line.slice(cols - 3) + '...';
                    }
                    values.push(line);
                }
            }
        }

        const valuesString = values.join('\n');

        const processName = options.processName || this._processName;
        info[MESSAGE] = `${date} ${processName}[${pid}] ${level} ${prefixString}${info.message}`;
        if(valuesString.length) {
            info[MESSAGE] = `${info[MESSAGE]}\n${valuesString}`;
        }

        return info;
    }
}