# winston-format-debug

[![NPM version](https://badge.fury.io/js/winston-format-debug.svg)](https://npmjs.org/package/winston-format-debug)
[![Build Status](https://travis-ci.org/jwalton/winston-format-debug.svg)](https://travis-ci.org/jwalton/winston-format-debug)
[![Coverage Status](https://coveralls.io/repos/jwalton/winston-format-debug/badge.svg)](https://coveralls.io/r/jwalton/winston-format-debug)
[![semantic-release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg)](https://github.com/semantic-release/semantic-release)

## What is it?

This is a format for console logging for [winston](https://github.com/winstonjs/winston).
It's based loosely on [bunyan-debug-stream](https://github.com/benbria/bunyan-debug-stream).

## Usage

```js
import winston from 'winston';
import debugFormat from 'winston-format-debug';

const logger = winston.createLogger({
    levels: winston.config.syslog.levels,
    level: 'info',
    transports: [
        new winston.transports.Console({
            format: winston.format.combine(
                winston.format.colorize({message: true}),
                debugFormat({
                    levels: winston.config.syslog.levels,
                })
            )
        })
    ]
});
```

## Options

### levels

A hash where keys are level names, and values are level numbers.  This is the
same `levels` you pass to `winston.createLogger({levels})`.

### processName

The name of the process.  If not specified, `winston-format-debugger` will
attempt to figure this out from `process.argv`.

### useColor

This should be true if you're using color in your output.  This is used to
"bold" lines in the stack trace that come from "your code".

### basePath

This is the root of your project.  This is used to strip prefixes from filenames,
in stack traces, and to decide which files are part of "your code" and which
are not.

### maxExceptionLines

The maximum number of lines to show in a stack trace.  If not specified,
defaults to unlimited.
