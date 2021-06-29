"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AirParser = void 0;
//require("module-alias/register");
const ziphandler_1 = require("./helpers/ziphandler");
const attributesHandler_1 = require("./helpers/attributesHandler");
const elementparser_1 = require("./parsers/elementparser");
const graphicFrameParser_1 = require("./parsers/graphicFrameParser");
const format = require("string-template");
class AirParser {
    constructor(PowerpointFilePath) {
        this.PowerpointFilePath = PowerpointFilePath;
    }
    ParsePowerPoint(slideNumber) {
        return __awaiter(this, void 0, void 0, function* () {
            //open Powerpoint File
            yield ziphandler_1.default.loadZip(this.PowerpointFilePath);
            const slideShowGlobals = yield ziphandler_1.default.parseSlideAttributes("ppt/presentation.xml");
            const pptElementParser = new elementparser_1.default();
            //only get slideAttributes for one slide and return as array
            const parsedSlideElements = yield this.getSlideElements(pptElementParser, slideNumber);
            const pptDetails = {
                slideShowGlobals,
                powerPointElements: parsedSlideElements,
                inputPath: this.PowerpointFilePath
            };
            return pptDetails;
            //TO-DO: Add option to parse All Slides by Default
            //TO-DO: Return the total # as part of a meta property
        });
    }
    getSlideElements(PPTElementParser, slideNumber) {
        return __awaiter(this, void 0, void 0, function* () {
            //Get all of Slide Shapes and Elements
            const slideAttributes = yield ziphandler_1.default.parseSlideAttributes(format("ppt/slides/slide{0}.xml", slideNumber));
            //Contains references to links,images and etc on a Slide
            const slideRelations = yield ziphandler_1.default.parseSlideAttributes(format("ppt/slides/_rels/slide{0}.xml.rels", slideNumber));
            const slideData = slideAttributes["p:sld"]["p:cSld"];
            //PROBLEM: Layering Order not Preserved, Shapes Render First, Need to fix
            const slideShapes = attributesHandler_1.getAttributeByPath(slideData, ["p:spTree", "p:sp"]);
            const slideImages = attributesHandler_1.getAttributeByPath(slideData, ["p:spTree", "p:pic"]);
            const graphicFrames = attributesHandler_1.getAttributeByPath(slideData, ["p:spTree", "p:graphicFrame"]);
            const slideTables = graphicFrameParser_1.default.processGraphicFrameNodes(graphicFrames);
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
        });
    }
}
exports.AirParser = AirParser;
