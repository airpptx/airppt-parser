"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const checkobj_1 = require("@helpers/checkobj");
const colorparser_1 = require("./colorparser");
const lineparser_1 = require("./lineparser");
const pptelement_1 = require("@models/pptelement");
/**
 * Parse the shape types and etc.
 */
class ShapeParser {
    static determineShapeType(prst) {
        switch (prst) {
            case "rect":
                return pptelement_1.ElementType.Rectangle;
            case "ellipse":
                return pptelement_1.ElementType.Ellipse;
            case "triangle":
                return pptelement_1.ElementType.Triangle;
            case "roundRect":
            //return ElementType.RoundedRectangle;
            case "rtTriangle":
            //return ElementType.RightTriangle;
            case "octagon":
            //return ElementType.Octagon;
            case "frame":
            //return ElementType.Frame;
            default:
                return pptelement_1.ElementType.Rectangle;
        }
    }
    static determineSpecialityType(element) {
        if (checkobj_1.CheckValidObject(element, '["p:nvSpPr"][0]["p:cNvSpPr"][0]["$"]["txBox"]') == 1) {
            return pptelement_1.SpecialityType.Textbox;
        }
        if (element["p:nvPicPr"]) {
            return pptelement_1.SpecialityType.Image;
        }
        return pptelement_1.SpecialityType.None;
    }
    static extractShapeElements(element) {
        return {
            fill: colorparser_1.default.getShapeFill(element),
            border: lineparser_1.default.extractLineElements(element),
            opacity: colorparser_1.default.getOpacity(element)
        };
    }
}
exports.default = ShapeParser;
