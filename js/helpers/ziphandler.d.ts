/// <reference types="node" />
export default class ZipHandler {
    private static zip;
    private static zipResult;
    static loadZip(zipFilePath: string): Promise<Boolean>;
    static parseSlideAttributes(fileName: any): Promise<any>;
    static getFileInZip(fileName: any): Promise<string>;
    static readFileBuffer(filePath: any): Promise<Buffer>;
}
