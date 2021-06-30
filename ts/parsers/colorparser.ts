import { CheckValidObject as checkPath } from "../helpers/checkobj";
import RelationParser from "./relparser";
import { PowerpointElement, FillType } from "airppt-models-plus/pptelement";
import * as isEmpty from "lodash.isempty";
/**
 * Parse the color of elements
 */
export default class ColorParser {
    static slideShowTheme;
    /**
     *
     * @param theme Parsed XML with theme colors
     */
    public static setSlideShowTheme(theme) {
        this.slideShowTheme = theme;
    }
    public static getShapeFill(element): PowerpointElement["shape"]["fill"] {
        //spPR takes precdence

        if (isEmpty(element["p:spPr"])) {
            return null;
        }

        const shapeProperties = element["p:spPr"][0];

        const fillType: PowerpointElement["shape"]["fill"] = {
            fillType: FillType.Solid,
            fillColor: "00FFFFF"
        };

        //spPR[NOFILL] return null
        if (shapeProperties["a:noFill"]) {
            return fillType;
        }

        //Shape fill is an image
        if (shapeProperties["a:blipFill"]) {
            const relId = shapeProperties["a:blipFill"][0]["a:blip"][0]["$"]["r:embed"];
            fillType.fillType = FillType.Image;
            fillType.fillColor = RelationParser.getRelationDetails(relId).Uri || "NONE";
            return fillType;
        }

        if (shapeProperties["a:solidFill"]) {
            //determine if it is theme or solid fill
            const solidColor =
                checkPath(shapeProperties, '["a:solidFill"]["0"]["a:srgbClr"]["0"]["$"]["val"]') ||
                this.getThemeColor(checkPath(shapeProperties, '["a:solidFill"]["0"]["a:schemeClr"]["0"]["$"]["val"]')) ||
                "FFFFFF";

            fillType.fillColor = solidColor;
            return fillType;
        }

        //look at p:style for shape default theme values
        const shapeStyle = checkPath(element, '["p:style"][0]');
        fillType.fillColor = this.getThemeColor(checkPath(shapeStyle, '["a:fillRef"]["0"]["a:schemeClr"]["0"]["$"]["val"]')) || "FFFFFF";
        return fillType;
    }

    public static getOpacity(element): number {
        //spPR takes precdence
        if (isEmpty(element["p:spPr"])) {
            return null;
        }

        const shapeProperties = element["p:spPr"][0];
        if (shapeProperties["a:solidFill"]) {
            //determine if it is theme or solid fill
            if (checkPath(shapeProperties, '["a:solidFill"]["0"]["a:srgbClr"]["0"]["a:alpha"][0]["$"]["val"]') != undefined) {
                return shapeProperties["a:solidFill"]["0"]["a:srgbClr"]["0"]["a:alpha"][0]["$"]["val"];
            }

            if (checkPath(shapeProperties, '["a:solidFill"]["0"]["a:schemeClr"]["0"]["a:alpha"][0]["$"]["val"]') != undefined) {
                return shapeProperties["a:solidFill"]["0"]["a:schemeClr"]["0"]["a:alpha"][0]["$"]["val"];
            }
        }

        //spPR[NOFILL] return null
        if (shapeProperties["a:noFill"]) {
            return 0;
        }

        return 1;
    }

    public static getTextColors(textElement): string {
        if ("a:solidFill" in textElement) {
            return (
                checkPath(textElement, '["a:solidFill"]["0"]["a:srgbClr"]["0"]["$"]["val"]') ||
                //commenting this as text colors are not required in our case
                // this.getThemeColor(checkPath(textElement, '["a:solidFill"]["0"]["a:schemeClr"]["0"]["$"]["val"]')) ||
                "000000"
            );
        }

        return "000000";
    }

    public static getThemeColor(themeClr) {
        if (!themeClr) {
            return null;
        }

        console.log("looking up theme clr");
        const colors = this.slideShowTheme["a:theme"]["a:themeElements"][0]["a:clrScheme"][0];
        const targetTheme = "a:" + themeClr;
        if (targetTheme in colors) {
            return colors[targetTheme][0]["a:srgbClr"][0]["$"]["val"];
        }

        return null;
    }

    public static determineShapeOpacity(element) {}
}
