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
                debugFormat({
                    levels: winston.config.syslog.levels,
                    colors: winston.config.syslog.colors
                })
            )
        })
    ]
});
```

## Options

### processName

The name of the process.  If not specified, `winston-format-debugger` will
attempt to figure this out from `process.argv`.

### levels

A hash where keys are level names, and values are level numbers.  This is the
same `levels` you pass to `winston.createLogger({levels})`.  If not specified,
defaults to `winston.config.npm.levels`.

### colors

Colors to use to colorize things.  You can also set `colors` to `false` to disable
all colors.  If not specified, defaults to `winston.config.npm.colors`.

### colorizePrefix, colorizeMessage, colorizeValues

`winston-format-debug` logs a message that looks something like this:

```log
Jun 28 20:55:16 process[7998] INFO: Hello world
    otherValue: "hello"
```

`colorizePrefix` controls whether or not the date, process name, and PID are
colorized (defaults to false).  `colorizeMessage` controls the text of the
message (defaults to true).  `colorizeValues` controls wether non-message values
are colorized (defaults to true).

These options are all ignored unless the `colors` option is passed in.

### basePath

This is the root of your project.  This is used to strip prefixes from filenames,
in stack traces, and to decide which files are part of "your code" and which
are not.

### maxExceptionLines

The maximum number of lines to show in a stack trace.  If not specified,
defaults to unlimited.

## Prefixers and Stringifiers

[bunyan-debug-stream](https://github.com/benbria/bunyan-debug-stream) has support
for "prefixers" and "stringifiers" which can be used to customize the log output.
These are not required in Winston, though, as you can easily write a `format`
which edits your data.  For example, if you had an `accountName` field, you
could do the same as a prefixer with:

```js
import winston from 'winston';

const accountPrefixer = winston.format(info => {
    info.message = `[${info.account}] ${info.message}`;
    return info;
});

const logger = winston.createLogger({
    transports: [
        new winston.transports.Console({
            format: winston.format.combine(
                accountPrefixer(),
                debugFormat()
            )
        })
    ]
});

```
