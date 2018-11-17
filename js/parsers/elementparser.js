"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const checkobj_1 = require("@helpers/checkobj");
const colorparser_1 = require("./colorparser");
const shapeparser_1 = require("./shapeparser");
const paragraphparser_1 = require("./paragraphparser");
const relparser_1 = require("./relparser");
/**
 * Entry point for all Parsers
 */
class PowerpointElementParser {
    constructor(slideShowGlobals, slideShowTheme) {
        this.slideShowGlobals = slideShowGlobals;
        this.slideShowTheme = slideShowTheme;
        colorparser_1.default.setSlideShowTheme(slideShowTheme);
    }
    getProcessedElement(rawElement, slideRelationships) {
        relparser_1.default.setSlideRelations(slideRelationships);
        try {
            if (!rawElement) {
                return null;
            }
            this.element = rawElement;
            let elementName = "";
            //
            if (this.element["p:nvSpPr"]) {
                elementName =
                    this.element["p:nvSpPr"][0]["p:cNvPr"][0]["$"]["title"] ||
                        this.element["p:nvSpPr"][0]["p:cNvPr"][0]["$"]["name"].replace(/\s/g, "");
            }
            else {
                //if the element is an image, get basic info like this
                elementName =
                    this.element["p:nvPicPr"][0]["p:cNvPr"][0]["$"]["title"] ||
                        this.element["p:nvPicPr"][0]["p:cNvPr"][0]["$"]["name"].replace(/\s/g, "");
            }
            //elements must have a position, or else ignore them. TO-DO: Allow Placeholder positions
            if (!this.element["p:spPr"][0]["a:xfrm"]) {
                return null;
            }
            let elementPosition = this.element["p:spPr"][0]["a:xfrm"][0]["a:off"][0]["$"];
            let elementPresetType = this.element["p:spPr"][0]["a:prstGeom"][0]["$"]["prst"];
            let elementOffsetPosition = this.element["p:spPr"][0]["a:xfrm"][0]["a:ext"][0]["$"];
            let paragraphInfo = checkobj_1.CheckValidObject(this.element, '["p:txBody"][0]["a:p"][0]');
            let pptElement = {
                name: elementName,
                shapeType: shapeparser_1.default.determineShapeType(elementPresetType),
                specialityType: shapeparser_1.default.determineSpecialityType(this.element),
                elementPosition: {
                    x: elementPosition.x,
                    y: elementPosition.y
                },
                elementOffsetPosition: {
                    cx: elementOffsetPosition.cx,
                    cy: elementOffsetPosition.cy
                },
                paragraph: paragraphparser_1.default.extractParagraphElements(paragraphInfo),
                shape: shapeparser_1.default.extractShapeElements(this.element),
                links: relparser_1.default.resolveShapeHyperlinks(this.element),
                raw: rawElement
            };
            return pptElement;
        }
        catch (e) {
            console.warn("ERR:", e);
            return null; //skip the element
        }
    }
}
exports.default = PowerpointElementParser;
