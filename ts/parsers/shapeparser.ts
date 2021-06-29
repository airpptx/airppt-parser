import { CheckValidObject as checkPath } from "../helpers/checkobj";
import ColorParser from "./colorparser";
import LineParser from "./lineparser";

import { PowerpointElement, SpecialityType } from "airppt-models/pptelement";

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
        if (checkPath(element, '["a:graphic"][0]["a:graphicData"][0]["a:tbl"]')) {
            return SpecialityType.Table;
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
