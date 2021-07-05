import * as format from "string-template";
import GraphicFrameParser from "../parsers/graphicFrameParser";
import ZipHandler from "../helpers/ziphandler";
import { getAttributeByPath } from "../helpers/attributesHandler";
import PowerpointElementParser from "../parsers/elementparser";


export default class SlideParser {

    public static async getSlideElements(PPTElementParser: PowerpointElementParser, slideNumber): Promise<any[]> {
        //Get all of Slide Shapes and Elements
        const slideAttributes = await ZipHandler.parseSlideAttributes(format("ppt/slides/slide{0}.xml", slideNumber));
        //Contains references to links,images and etc on a Slide
        const slideRelations = await ZipHandler.parseSlideAttributes(format("ppt/slides/_rels/slide{0}.xml.rels", slideNumber));

        const slideData = slideAttributes["p:sld"]["p:cSld"];

        //PROBLEM: Layering Order not Preserved, Shapes Render First, Need to fix
        const slideShapes = getAttributeByPath(slideData, ["p:spTree", "p:sp"]);
        const slideImages = getAttributeByPath(slideData, ["p:spTree", "p:pic"]);
        const graphicFrames = getAttributeByPath(slideData, ["p:spTree", "p:graphicFrame"]);
        const slideTables = GraphicFrameParser.processGraphicFrameNodes(graphicFrames);

        const allSlideElements = [...slideShapes, ...slideImages, ...slideTables];

        const allParsedSlideElements = [];
        for (const slideElement of allSlideElements) {
            const pptElement = PPTElementParser.getProcessedElement(slideElement, slideRelations);

            //throwout any undrenderable content
            if (pptElement) {
                allParsedSlideElements.push(pptElement);
            }
        }

        return allParsedSlideElements;
    }
}
