//handle all zip file actions here
import * as JSZip from "jszip";
import fs = require("fs");
import * as xml2js from "xml2js-es6-promise";

export default class ZipHandler {
    private static readonly zip = new JSZip();
    private static zipResult: JSZip;

    public static async loadZip(zipFilePath: string) {
            const data = await this.readFileBuffer(zipFilePath);
            this.zipResult = await this.zip.loadAsync(data).catch(error => {
                throw error;
            });
    }

    public static async parseSlideAttributes(fileName) {
        const presentationSlide = await this.zipResult.file(fileName).async("text");
        const parsedPresentationSlide = await xml2js(presentationSlide, {
            trim: true,
            preserveChildrenOrderForMixedContent: true
        });

        return parsedPresentationSlide;
    }

    public static async getFileInZip(fileName) {
        const file = await this.zipResult.file(fileName).async("base64");
        return file;
    }

    public static readFileBuffer(filePath): Promise<Buffer> {
        return new Promise(function (resolve, reject) {
            fs.readFile(filePath, (err, data) => {
                err ? reject(err) : resolve(data);
            });
        });
    }
}
