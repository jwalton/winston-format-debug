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
