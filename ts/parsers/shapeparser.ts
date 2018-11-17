import { CheckValidObject as checkPath } from "@helpers/checkobj";
import ColorParser from "./colorparser";
import LineParser from "./lineparser";
import { PowerpointElement, ElementType, TextAlignment, FontAttributes, SpecialityType, FillType } from "@models/pptelement";

/**
 * Parse the shape types and etc.
 */
export default class ShapeParser {
	public static determineShapeType(prst): ElementType {
		switch (prst) {
			case "rect":
				return ElementType.Rectangle;
			case "ellipse":
				return ElementType.Ellipse;
			case "triangle":
				return ElementType.Triangle;
			case "roundRect":
			//return ElementType.RoundedRectangle;
			case "rtTriangle":
			//return ElementType.RightTriangle;
			case "octagon":
			//return ElementType.Octagon;
			case "frame":
			//return ElementType.Frame;
			default:
				return ElementType.Rectangle;
		}
	}

	public static determineSpecialityType(element): SpecialityType {
		if (checkPath(element, '["p:nvSpPr"][0]["p:cNvSpPr"][0]["$"]["txBox"]') == 1) {
			return SpecialityType.Textbox;
		}

		if (element["p:nvPicPr"]) {
			return SpecialityType.Image;
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
