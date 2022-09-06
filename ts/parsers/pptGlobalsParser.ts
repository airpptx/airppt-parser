import { PptSection } from 'airppt-models-plus/pptdetails';
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

    public static async getSections(pptFilePath: string): Promise<PptSection[]> {
        try {
            const slideShowGlobals = await FileHandler.parseContentFromFile(join(pptFilePath, "ppt/presentation.xml"));

            let allSections: any[] = getAttributeByPath(slideShowGlobals, ["p:presentation", "p:extLst", "p:ext", "p14:sectionLst", "p14:section"], []);
            allSections = allSections.filter(section => section?.["p14:sldIdLst"]?.[0]?.["p14:sldId"]?.length);
            let slidesCount = 0;
            
            return allSections.map((section) => {
              const sectionSlidesLength = section["p14:sldIdLst"][0]["p14:sldId"].length;
              const startingSlide = slidesCount;
              slidesCount += sectionSlidesLength;

              return {
                title: section["$"]["name"],
                startingSlide: startingSlide,
                lastSlide: slidesCount - 1,
              };
            });
        } catch (error) {
            throw error;
        }
    }
}
