import * as path from 'path';
import { dateToString, rpad, applyColors } from './utils';
import { LEVEL, MESSAGE, configs } from 'triple-beam';
import exceptionFormatter from 'exception-formatter';

const INDENT = '    ';

export interface DebugFormatOptions {
    levels?: {[name: string]: number};
    colors?: {[name: string]: string | string[]};
    processName?: string;
    basePath?: string;
    maxExceptionLines?: number;
    colorizePrefix?: boolean;
    colorizeMessage?: boolean;
    colorizeValues?: boolean;
}

/**
 * Debug formatter intended for logging to console.  This is roughly a port
 * of bunyan-debug-stream.
 */
export class DebugFormat {
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

    _getPrefix(info: any, options: DebugFormatOptions) {
        const processName = options.processName || this._processName;
        const date = dateToString(new Date());
        const level: string = info[LEVEL] || info.level || 'info';
        const pid = process.pid;

        // If `info.level` is defined, use it for the level label - just in
        // case some previous formatter has colorized it or done something
        // else exciting.
        const levelLabel = rpad(`${(info.level || level).toUpperCase()}:`, this._maxLevelLength + 1);
        return `${date} ${processName}[${pid}] ${levelLabel}`;
    }

    _getValues(info: any, options: DebugFormatOptions) {
        const values = [];
        for(const key of Object.keys(info)) {
            // Skip fields we don't care about
            if (key === 'level' || key === 'message') {
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

        return values;
    }

    _formatError(err: Error, options: DebugFormatOptions) : string {
        const formatOptions = {
            format: options.colors ? 'ansi' : 'ascii',
            colors: false,
            basepath: options.basePath || this._basepath,
            maxLines: options.maxExceptionLines
        };

        const formatted = exceptionFormatter(err, formatOptions);

        return formatted.split('\n').join(`\n${INDENT}`);
    }

    transform(info: any, options: DebugFormatOptions) {
        const level: string = info[LEVEL] || info.level || 'info';

        let prefix = this._getPrefix(info, options);
        let message = info.message;
        let valuesString = this._getValues(info, options).join('\n');

        if(options.colors && options.colors[level]) {
            const colorizePrefix = !!options.colorizePrefix;
            const colorizeMessage = (!('colorizeMessage' in options)) || options.colorizeMessage;
            const colorizeValues = (!('colorizeValues' in options)) || options.colorizeValues;

            if(colorizePrefix) {
                prefix = applyColors(prefix, options.colors[level]);
            }
            if(colorizeMessage) {
                message = applyColors(message, options.colors[level]);
            }
            if(colorizeValues && valuesString) {
                valuesString = applyColors(valuesString, options.colors[level]);
            }
        }

        let result = `${prefix} ${message}`;
        if(valuesString.length) {
            result = `${result}\n${valuesString}`;
        }
        info[MESSAGE] = result;

        return info;
    }
}

export default function createDebugFormat(options: DebugFormatOptions={}) {
    return new DebugFormat(options);
}

//
// Attach the Colorizer for registration purposes
//
export const Format = DebugFormat; // tslint:disable-line
