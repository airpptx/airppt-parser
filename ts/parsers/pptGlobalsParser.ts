import { getAttributeByPath } from "../helpers/attributesHandler";
import ZipHandler from "../helpers/ziphandler";

export default class PptGlobalsParser {
    public static async getSlidesLength(pptFilePath: string) {
        //@todo: PROBLEM - Implement error handling
        await ZipHandler.loadZip(pptFilePath);
        const slideShowGlobals = await ZipHandler.parseSlideAttributes("ppt/presentation.xml");

        return getAttributeByPath(slideShowGlobals, ["p:presentation", "p:sldIdLst", "p:sldId"]).length;
    }
}
