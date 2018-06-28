import * as path from 'path';
import { dateToString, rpad } from './utils';
import { LEVEL, MESSAGE, configs } from 'triple-beam';
import exceptionFormatter from 'exception-formatter';

const INDENT = '    ';

export interface DebugFormatOptions {
    levels?: {[name: string]: number};
    processName?: string;
    useColor?: boolean;
    basePath?: string;
    maxExceptionLines?: number;
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

        const values = [];
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
        info[MESSAGE] = `${date} ${processName}[${pid}] ${level} ${info.message}`;
        if(valuesString.length) {
            info[MESSAGE] = `${info[MESSAGE]}\n${valuesString}`;
        }

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
