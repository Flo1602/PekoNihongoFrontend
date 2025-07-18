export interface IFileProvider {
    provideFile(): Promise<File>;
}