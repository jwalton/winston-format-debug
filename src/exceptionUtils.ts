import chalk from 'chalk';

export interface ColorExceptionOptions {
    /**
     * True to enable ANSI colors.
     */
    color?: boolean;
    /**
     * basePath is used to determine whether a file is part of this project
     * or not.  If it is not set, then all files are considered part of the
     * project.
     */
    basePath?: string;
    /**
     * Maximum number of lines of stack trace to show. undefined for unlimited.
     * "auto" truncate after "own" code.
     */
    maxLines?: number | 'auto';
}

const stackTraceRegexp = /^( *)at (.*)\((.*)\)/;

const TRUNCATE_IF_NO_OWN_LINES = 5;

/**
 * Format an exception for console output.
 */
export function formatException(err: Error | string, options: ColorExceptionOptions): string {
    const color = options.color ?? true;
    const { basePath, maxLines } = options;
    const errString = errToString(err);

    const lines = errString.split('\n');
    const headerLines: string[] = [];
    const traceLines: string[] = [];

    let readingHeader = true;
    let lastOwnLine = -1;
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const match = stackTraceRegexp.exec(line);

        // Dump anything at the top into the 'header'.
        if (!match && readingHeader) {
            headerLines.push(line);
            continue;
        }
        readingHeader = false;

        // Anything after the header we'll try to parse and work out if it is
        // "our code" or not.
        if (!match) {
            traceLines.push(line);
        } else {
            const [, indent, fnName, fileName] = match;
            const matchesBaseMatch = basePath && fileName.startsWith(basePath);

            let relativeFileName = fileName;
            if (basePath && matchesBaseMatch) {
                relativeFileName = '.' + fileName.slice(basePath.length);
                lastOwnLine = i;
            }

            let traceLine = `${indent}at ${fnName}(${relativeFileName})`;
            if (color && matchesBaseMatch) {
                traceLine = chalk.bold(traceLine);
            }

            traceLines.push(traceLine);
        }
    }

    // Truncate the trace if we have too many lines.
    if (basePath && maxLines === 'auto') {
        if (lastOwnLine === -1 && traceLines.length > TRUNCATE_IF_NO_OWN_LINES) {
            traceLines.length = TRUNCATE_IF_NO_OWN_LINES;
            traceLines.push('    [truncated]');
        } else if (traceLines.length > lastOwnLine) {
            traceLines.length = lastOwnLine;
            traceLines.push('    [truncated]');
        }
    } else if (typeof maxLines === 'number' && traceLines.length > maxLines) {
        traceLines.length = maxLines;
        traceLines.push('    [truncated]');
    }

    return headerLines.concat(traceLines).join('\n');
}

function errToString(err: Error | string): string {
    let errString: string;
    if (typeof err === 'string') {
        errString = err;
    } else {
        errString = err.stack || `${err}`;
    }

    return errString;
}
