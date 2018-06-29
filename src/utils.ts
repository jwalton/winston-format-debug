import colors from 'colors/safe';

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
    if(!message) {
        return message;
    }

    if(typeof(colorList) === 'string') {
        message = (colors as any)[colorList](message);
    } else {
        for(const color of colorList) {
            message = (colors as any)[color](message);
        }
    }

    return message;
}

const MONTHS = [
    'Jan', 'Feb', 'Mar', 'Apr',
    'May', 'Jun', 'Jul', 'Aug',
    'Sep', 'Oct', 'Nov', 'Dec'
];

export function dateToString(date: Date) {
    const time = [
        (lpad(date.getHours(), 2, '0')),
        (lpad(date.getMinutes(), 2, '0')),
        (lpad(date.getSeconds(), 2, '0'))
    ].join(':');

    return [MONTHS[date.getMonth()], date.getDate(), time].join(' ');
}
