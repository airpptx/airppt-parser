"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const checkobj_1 = require("@helpers/checkobj");
const relparser_1 = require("./relparser");
const pptelement_1 = require("@models/pptelement");
/**
 * Parse the color of elements
 */
class ColorParser {
    /**
     *
     * @param theme Parsed XML with theme colors
     */
    static setSlideShowTheme(theme) {
        this.slideShowTheme = theme;
    }
    static getShapeFill(element) {
        //spPR takes precdence
        let shapeProperties = element["p:spPr"][0];
        let fillType = {
            fillType: pptelement_1.FillType.Solid,
            fillColor: "00FFFFF"
        };
        //spPR[NOFILL] return null
        if (shapeProperties["a:noFill"]) {
            return fillType;
        }
        //Shape fill is an image
        if (shapeProperties["a:blipFill"]) {
            let relId = shapeProperties["a:blipFill"][0]["a:blip"][0]["$"]["r:embed"];
            fillType.fillType = pptelement_1.FillType.Image;
            fillType.fillColor = relparser_1.default.getRelationDetails(relId).Uri || "NONE";
            return fillType;
        }
        if (shapeProperties["a:solidFill"]) {
            //determine if it is theme or solid fill
            let solidColor = checkobj_1.CheckValidObject(shapeProperties, '["a:solidFill"]["0"]["a:srgbClr"]["0"]["$"]["val"]') ||
                this.getThemeColor(checkobj_1.CheckValidObject(shapeProperties, '["a:solidFill"]["0"]["a:schemeClr"]["0"]["$"]["val"]')) ||
                "FFFFFF";
            fillType.fillColor = solidColor;
            return fillType;
        }
        //look at p:style for shape default theme values
        let shapeStyle = checkobj_1.CheckValidObject(element, '["p:style"][0]');
        fillType.fillColor = this.getThemeColor(checkobj_1.CheckValidObject(shapeStyle, '["a:fillRef"]["0"]["a:schemeClr"]["0"]["$"]["val"]')) || "FFFFFF";
        return fillType;
    }
    static getOpacity(element) {
        //spPR takes precdence
        let shapeProperties = element["p:spPr"][0];
        if (shapeProperties["a:solidFill"]) {
            //determine if it is theme or solid fill
            if (checkobj_1.CheckValidObject(shapeProperties, '["a:solidFill"]["0"]["a:srgbClr"]["0"]["a:alpha"][0]["$"]["val"]') != undefined) {
                return shapeProperties["a:solidFill"]["0"]["a:srgbClr"]["0"]["a:alpha"][0]["$"]["val"];
            }
            if (checkobj_1.CheckValidObject(shapeProperties, '["a:solidFill"]["0"]["a:schemeClr"]["0"]["a:alpha"][0]["$"]["val"]') != undefined) {
                return shapeProperties["a:solidFill"]["0"]["a:schemeClr"]["0"]["a:alpha"][0]["$"]["val"];
            }
        }
        //spPR[NOFILL] return null
        if (shapeProperties["a:noFill"]) {
            return 0;
        }
        return 1;
    }
    static getTextColors(textElement) {
        if ("a:solidFill" in textElement) {
            return (checkobj_1.CheckValidObject(textElement, '["a:solidFill"]["0"]["a:srgbClr"]["0"]["$"]["val"]') ||
                this.getThemeColor(checkobj_1.CheckValidObject(textElement, '["a:solidFill"]["0"]["a:schemeClr"]["0"]["$"]["val"]')) ||
                "000000");
        }
    }
    static getThemeColor(themeClr) {
        if (!themeClr) {
            return null;
        }
        console.log("looking up theme clr");
        let colors = this.slideShowTheme["a:theme"]["a:themeElements"][0]["a:clrScheme"][0];
        let targetTheme = "a:" + themeClr;
        if (targetTheme in colors) {
            return colors[targetTheme][0]["a:srgbClr"][0]["$"]["val"];
        }
        return null;
    }
    static determineShapeOpacity(element) { }
}
exports.default = ColorParser;
