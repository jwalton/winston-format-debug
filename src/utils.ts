import chalk from 'chalk';

export function lpad(str: any, count: number, fill = ' ') {
    str = `${str}`;
    while (str.length < count) {
        str = fill + str;
    }
    return str;
}

export function rpad(str: any, count: number, fill = ' ') {
    str = `${str}`;
    while (str.length < count) {
        str = str + fill;
    }
    return str;
}

// Applies one or more colors to a message, and returns the colorized message.
export function applyColors(message: string, colorList: string | string[]) {
    if (!message) {
        return message;
    }

    if (typeof colorList === 'string') {
        message = applyColor(message, colorList);
    } else {
        for (const color of colorList) {
            message = applyColor(message, color);
        }
    }

    return message;
}

function applyColor(message: string, color: string) {
    const chalkColor = COLOR_TRANSLATIONS[color];
    if (chalkColor) {
        return (chalk[chalkColor] as any)(message);
    } else if (color.startsWith('#')) {
        return chalk.hex(color)(message);
    } else {
        return message;
    }
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export function dateToString(date: Date) {
    const time = [
        lpad(date.getHours(), 2, '0'),
        lpad(date.getMinutes(), 2, '0'),
        lpad(date.getSeconds(), 2, '0'),
    ].join(':');

    return [MONTHS[date.getMonth()], date.getDate(), time].join(' ');
}

const COLOR_TRANSLATIONS: { [key: string]: keyof typeof chalk | undefined } = {
    // Valid colors from winston
    black: 'black',
    red: 'red',
    green: 'green',
    yellow: 'yellow',
    blue: 'blue',
    magenta: 'magenta',
    cyan: 'cyan',
    white: 'white',
    blackBG: 'bgBlack',
    redBG: 'bgRed',
    greenBG: 'bgGreen',
    yellowBG: 'bgYellow',
    blueBG: 'bgBlue',
    magentaBG: 'bgMagenta',
    cyanBG: 'bgCyan',
    whiteBG: 'bgWhite',
    bold: 'bold',
    dim: 'dim',
    italic: 'italic',
    underline: 'underline',
    inverse: 'inverse',
    hidden: 'hidden',
    strikethrough: 'strikethrough',

    // Chalk colors
    gray: 'gray',
    grey: 'grey',
    bgBlack: 'bgBlack',
    bgRed: 'bgRed',
    bgGreen: 'bgGreen',
    bgYellow: 'bgYellow',
    bgBlue: 'bgBlue',
    bgMagenta: 'bgMagenta',
    bgCyan: 'bgCyan',
    bgWhite: 'bgWhite',
    bgGray: 'bgGray',
    bgGrey: 'bgGrey',
    blackBright: 'blackBright',
    redBright: 'redBright',
    greenBright: 'greenBright',
    yellowBright: 'yellowBright',
    blueBright: 'blueBright',
    magentaBright: 'magentaBright',
    cyanBright: 'cyanBright',
    whiteBright: 'whiteBright',
    bgBlackBright: 'bgBlackBright',
    bgRedBright: 'bgRedBright',
    bgGreenBright: 'bgGreenBright',
    bgYellowBright: 'bgYellowBright',
    bgBlueBright: 'bgBlueBright',
    bgMagentaBright: 'bgMagentaBright',
    bgCyanBright: 'bgCyanBright',
    bgWhiteBright: 'bgWhiteBright',

    // These are from the "colors" library, which we used to use.
    brightRed: 'redBright',
    brightGreen: 'greenBright',
    brightYellow: 'yellowBright',
    brightBlue: 'blueBright',
    brightMagenta: 'magentaBright',
    brightCyan: 'cyanBright',
    brightWhite: 'whiteBright',
    bgBrightRed: 'bgRedBright',
    bgBrightGreen: 'bgGreenBright',
    bgBrightYellow: 'bgYellowBright',
    bgBrightBlue: 'bgBlueBright',
    bgBrightMagenta: 'bgMagentaBright',
    bgBrightCyan: 'bgCyanBright',
    bgBrightWhite: 'bgWhiteBright',
    rainbow: 'whiteBright',
    zebra: 'whiteBright',
    america: 'whiteBright',
    trap: 'whiteBright',
};
