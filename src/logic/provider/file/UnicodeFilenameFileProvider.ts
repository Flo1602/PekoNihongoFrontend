import type { IFileProvider } from "./IFileProvider";

export class UnicodeFilenameFileProvider implements IFileProvider {
    private readonly resourcePath: string;
    private readonly prefix: string;
    private readonly expectedFilenameLength: number;
    private readonly extension: string;
    private charForFilename?: string;

    constructor(
        resourcePath: string,
        prefix: string,
        expectedFilenameLength: number,
        extension: string
    ) {
        this.resourcePath = resourcePath;
        this.prefix = prefix;
        this.expectedFilenameLength = expectedFilenameLength;
        this.extension = extension;
    }

    setCharForFilename(charForFilename: string): void {
        if (charForFilename.length !== 1) {
            throw new Error("charForFilename must be a single character.");
        }

        this.charForFilename = charForFilename;
    }

    async provideFile(): Promise<File> {
        if (!this.charForFilename) {
            throw new Error("charForFilename has not been set.");
        }

        const charCodeHex = this.charForFilename.charCodeAt(0).toString(16).padStart(2, "0");
        const paddingLength = this.expectedFilenameLength - charCodeHex.length;

        const fileName = this.prefix.repeat(paddingLength > 0 ? paddingLength : 0) + charCodeHex + "." + this.extension;
        const fileUrl = `${this.resourcePath}/${fileName}`;

        const response = await fetch(fileUrl);
        if (!response.ok) {
            throw new Error(`Failed to fetch file from ${fileUrl}`);
        }

        const blob = await response.blob();
        return new File([blob], fileName, { type: blob.type });
    }
}