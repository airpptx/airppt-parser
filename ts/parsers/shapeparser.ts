import { checkPath, getValueAtPath } from "../helpers";
import { ColorParser, LineParser } from "./";
import { PowerpointElement, SpecialityType } from "airppt-models-plus/pptelement";

/**
 * Parse the shape types and etc.
 */
export default class ShapeParser {
    public static determineShapeType(prst): any {
        //return the preset ppt shape type
        return prst;
    }

    public static determineSpecialityType(element): SpecialityType {
        if (element["p:nvPicPr"]) {
            return SpecialityType.Image;
        }
        if (checkPath(element, '["p:txBody"][0]["a:p"]')) {
            return SpecialityType.Paragraph;
        }
        if (checkPath(element, '["a:graphic"][0]["a:graphicData"][0]["a:tbl"]')) {
            return SpecialityType.Table;
        }

        if (getValueAtPath(element, '["p:nvSpPr"][0]["p:nvPr"][0]["p:ph"][0]["$"]["type"]') === "ctrTitle") {
            return SpecialityType.Title;
        }

        return SpecialityType.None;
    }

    public static extractShapeElements(element): PowerpointElement["shape"] {
        return {
            fill: ColorParser.getShapeFill(element),
            border: LineParser.extractLineElements(element),
            opacity: ColorParser.getOpacity(element)
        };
    }
}
