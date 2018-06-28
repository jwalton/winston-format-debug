declare module 'triple-beam' {
    export interface Config {
        levels: {[level: string]: number},
        colors: {[level: string]: string}
    }

    export const LEVEL: symbol;
    export const MESSAGE: symbol;
    export const SPLAT: symbol;
    export const configs: {
        cli: Config,
        npm: Config,
        syslog: Config
    };
}