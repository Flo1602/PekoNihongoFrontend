import type { ISvgPathParser } from "./ISvgParser";

export class SvgPathParser implements ISvgPathParser {
    async parse(file: File): Promise<string[]> {
        const regex = /d="([^"]+)"\/?>/g;
        const parsedSVGPaths: string[] = [];

        const content = await file.text(); // Read SVG content as text
        let match: RegExpExecArray | null;

        while ((match = regex.exec(content)) !== null) {
            parsedSVGPaths.push(match[1]);
        }

        return parsedSVGPaths;
    }
}