import { promises as fs } from "fs";
import * as xml2js from "xml2js-es6-promise";

export default class FileHandler {
    public static async parseContentFromFile(fileName) {
        return await xml2js(await fs.readFile(fileName, "utf8"), {
            trim: true,
            preserveChildrenOrderForMixedContent: true
        });
    }
}
