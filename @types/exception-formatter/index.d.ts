declare module 'exception-formatter' {
    namespace exceptionFormatter {
        export interface CommonOptions {
            maxLines?: number | null,
            basepath?: string,
            basePathReplacement?: string,
        }

        export type AsciiOptions = CommonOptions;

        export type AnsiOptions = {
            format: 'ansi',
            colors?: boolean
        } & CommonOptions;

        export type HtmlOptions = {
            format: 'html',
            inlineStyle?: boolean
        } & CommonOptions;
    }

    function exceptionFormatter(
        err: Error,
        options: exceptionFormatter.AsciiOptions |
            exceptionFormatter.AnsiOptions |
            exceptionFormatter.HtmlOptions
    ) : string;

    export = exceptionFormatter;
}