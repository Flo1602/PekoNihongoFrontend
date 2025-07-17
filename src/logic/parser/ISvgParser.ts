export interface ISVGPathParser {
    parse(file: File): Promise<string[]>;
}