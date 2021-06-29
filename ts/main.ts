//require("module-alias/register");
import ZipHandler from "./helpers/ziphandler";
import { getAttributeByPath } from "./helpers/attributesHandler";
import PowerpointElementParser from "./parsers/elementparser";
import GraphicFrameParser from "./parsers/graphicFrameParser";
import { PowerpointDetails } from "airppt-models/pptdetails";
import * as format from "string-template";

export class AirParser {
    constructor(private PowerpointFilePath: string) {}

    public async ParsePowerPoint(slideNumber: number): Promise<PowerpointDetails> {
        //open Powerpoint File
        await ZipHandler.loadZip(this.PowerpointFilePath);
        const slideShowGlobals = await ZipHandler.parseSlideAttributes("ppt/presentation.xml");
        const pptElementParser = new PowerpointElementParser();

        //only get slideAttributes for one slide and return as array
        const parsedSlideElements = await this.getSlideElements(pptElementParser, slideNumber);

        const pptDetails: PowerpointDetails = {
            slideShowGlobals,
            powerPointElements: parsedSlideElements,
            inputPath: this.PowerpointFilePath
        };

        return pptDetails;

        //TO-DO: Add option to parse All Slides by Default
        //TO-DO: Return the total # as part of a meta property
    }

    private async getSlideElements(PPTElementParser: PowerpointElementParser, slideNumber) {
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
