export interface ISvgPathParser {
    parse(file: File): Promise<string[]>;
}