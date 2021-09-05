import { join } from 'path';
import { getAttributeByPath, FileHandler } from "../helpers";

export default class PptGlobalsParser {
    public static async getSlidesLength(pptFilePath: string) {
        try {
            const slideShowGlobals = await FileHandler.parseContentFromFile(join(pptFilePath, "ppt/presentation.xml"));

            return getAttributeByPath(slideShowGlobals, ["p:presentation", "p:sldIdLst", "p:sldId"], []).length;
        } catch (error) {
            throw error;
        }
    }
}
