import { checkPath, getAttributeByPath, getValueAtPath } from "../helpers";
import { PowerpointElement } from "airppt-models-plus/pptelement";
import { GraphicFrameParser, ShapeParser, SlideRelationsParser, ParagraphParser } from "./";
import { cleanupJson } from "../utils/common";
import * as isEmpty from "lodash.isempty";

/**
 * Entry point for all Parsers
 */
class PowerpointElementParser {
    private element;

    public getLayoutSpNodes(slideLayoutTables, slideMasterTables) {
        const idx =
            getAttributeByPath(this.element, ["p:nvSpPr", "p:nvPr", "p:ph"]) === undefined
                ? undefined
                : getAttributeByPath(this.element, ["p:nvSpPr", "p:nvPr", "p:ph", "$", "idx"]);
        const type =
            getAttributeByPath(this.element, ["p:nvSpPr", "p:nvPr", "p:ph"]) === undefined
                ? undefined
                : getAttributeByPath(this.element, ["p:nvSpPr", "p:nvPr", "p:ph", "$", "type"]);

        let slideLayoutSpNode = undefined;
        let slideMasterSpNode = undefined;

        if (type !== undefined) {
            slideLayoutSpNode = slideLayoutTables["typeTable"][type];
            slideMasterSpNode = slideMasterTables["typeTable"][type];
            return { slideLayoutSpNode, slideMasterSpNode };
        }
        if (idx !== undefined) {
            slideLayoutSpNode = slideLayoutTables["idxTable"][idx];
            slideMasterSpNode = slideMasterSpNode["idxTable"][idx];
            return { slideLayoutSpNode, slideMasterSpNode };
        }
        return { slideLayoutSpNode, slideMasterSpNode };
    }

    public getPosition(slideLayoutTables, slideMasterTables) {
        let position: PowerpointElement["elementPosition"] = null;
        let offset: PowerpointElement["elementOffsetPosition"] = null;

        const { slideLayoutSpNode, slideMasterSpNode } = this.getLayoutSpNodes(
            slideLayoutTables,
            slideMasterTables
        );

        const xfrmNodePath = '["p:spPr"][0]["a:xfrm"][0]';
        const slideXfrmNode = getValueAtPath(this.element, xfrmNodePath);
        const slideLayoutXfrmNode = getValueAtPath(slideLayoutSpNode, xfrmNodePath);
        const slideMasterXfrmNode = getValueAtPath(slideMasterSpNode, xfrmNodePath);

        if (slideXfrmNode && checkPath(slideXfrmNode, '["a:off"][0]["$"]')) {
            position = slideXfrmNode["a:off"][0]["$"];
            offset = slideXfrmNode["a:ext"][0]["$"];

            return { position, offset };
        }

        if (slideLayoutXfrmNode && checkPath(slideLayoutXfrmNode, '["a:off"][0]["$"]')) {
            position = slideLayoutXfrmNode["a:off"][0]["$"];
            offset = slideLayoutXfrmNode["a:ext"][0]["$"];

            return { position, offset };
        }

        if (slideMasterXfrmNode && checkPath(slideMasterXfrmNode, '["a:off"][0]["$"]')) {
            position = slideMasterXfrmNode["a:off"][0]["$"];
            offset = slideMasterXfrmNode["a:ext"][0]["$"];

            return { position, offset };
        }

        return { position, offset };
    }
    public getProcessedElement(
        rawElement,
        slideLayoutTables,
        slideMasterTables,
        slideRelationships
    ): PowerpointElement {
        SlideRelationsParser.setSlideRelations(slideRelationships);
        try {
            if (!rawElement) {
                return null;
            }
            this.element = rawElement;

            let elementName = "";
            let table = null;

            if (this.element["p:nvSpPr"]) {
                elementName =
                    this.element["p:nvSpPr"][0]["p:cNvPr"][0]["$"]["title"] ||
                    this.element["p:nvSpPr"][0]["p:cNvPr"][0]["$"]["name"].replace(/\s/g, "");
            } else if (this.element["p:nvPicPr"]) {
                //if the element is an image, get basic info like this
                elementName =
                    this.element["p:nvPicPr"][0]["p:cNvPr"][0]["$"]["title"] ||
                    this.element["p:nvPicPr"][0]["p:cNvPr"][0]["$"]["name"].replace(/\s/g, "");
            }
            //check only if its the table, in future can be changed it to overall graphic types e.g. diagrams, charts.
            //but for now only doing the tables.
            else if (checkPath(this.element, '["a:graphic"][0]["a:graphicData"][0]["a:tbl"]')) {
                elementName =
                    this.element["p:nvGraphicFramePr"][0]["p:cNvPr"][0]["$"]["title"] ||
                    this.element["p:nvGraphicFramePr"][0]["p:cNvPr"][0]["$"]["name"].replace(
                        /\s/g,
                        ""
                    );
                table = GraphicFrameParser.extractTableElements(this.element);
            }

            const elementPresetType =
                getValueAtPath(this.element, '["p:spPr"][0]["a:prstGeom"][0]["$"]["prst"]') ||
                "none";

            const paragraphInfo = getValueAtPath(this.element, '["p:txBody"][0]["a:p"]');
            const { position, offset } = this.getPosition(slideLayoutTables, slideMasterTables);

            let pptElement: PowerpointElement = {
                name: elementName,
                shapeType: ShapeParser.determineShapeType(elementPresetType),
                specialityType: ShapeParser.determineSpecialityType(this.element),
                elementPosition: {
                    x: position?.x,
                    y: position?.y
                },
                elementOffsetPosition: {
                    cx: offset?.cx,
                    cy: offset?.cy
                },
                table: !isEmpty(table) && !isEmpty(table.rows) ? table : null,
                paragraph: ParagraphParser.extractParagraphElements(paragraphInfo),
                shape: ShapeParser.extractShapeElements(this.element),
                links: SlideRelationsParser.resolveShapeHyperlinks(this.element)
            };

            pptElement = cleanupJson(pptElement);

            return pptElement;
        } catch (e) {
            console.warn("ERR could not parse element:", e);

            return null; //skip the element
        }
    }
}

export default PowerpointElementParser;
