"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const checkobj_1 = require("../helpers/checkobj");
const colorparser_1 = require("./colorparser");
const lineparser_1 = require("./lineparser");
const pptelement_1 = require("airppt-models-plus/pptelement");
/**
 * Parse the shape types and etc.
 */
class ShapeParser {
    static determineShapeType(prst) {
        //return the preset ppt shape type
        return prst;
    }
    static determineSpecialityType(element) {
        if (element["p:nvPicPr"]) {
            return pptelement_1.SpecialityType.Image;
        }
        if (checkobj_1.CheckValidObject(element, '["a:graphic"][0]["a:graphicData"][0]["a:tbl"]')) {
            return pptelement_1.SpecialityType.Table;
        }
        if (checkobj_1.CheckValidObject(element, '["p:nvSpPr"][0]["p:nvPr"][0]["p:ph"][0]["$"]["type"]') === "ctrTitle") {
            return pptelement_1.SpecialityType.Title;
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
