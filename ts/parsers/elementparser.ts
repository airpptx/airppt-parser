import { checkPath, getValueAtPath } from "../helpers";
import { PowerpointElement, SpecialityType } from "airppt-models-plus/pptelement";
import { GraphicFrameParser, ShapeParser, SlideRelationsParser, ParagraphParser } from "./";
import { cleanupJson } from "../utils/common";
import * as isEmpty from "lodash.isempty";
import { SUPPORTED_PLACEHOLDERS } from "../utils/constants";

const ELEMENTS_ROOT_NODE = {
    [SpecialityType.Paragraph]: "p:nvSpPr",
    [SpecialityType.Title]: "p:nvSpPr",
    [SpecialityType.Image]: "p:nvPicPr",
    [SpecialityType.Table]: "p:nvGraphicFramePr"
};

/**
 * Entry point for all Parsers
 */
class PowerpointElementParser {
    private element;
    //relevant nodes for this element in slide layout and slide master layout
    private slideLayoutSpNode;
    private slideMasterSpNode;

    public isNonSupportedPlaceholder() {
        if (checkPath(this.element, '["p:nvSpPr"][0]["p:nvPr"][0]["p:ph"][0]["$"]["type"]')) {
            const type = getValueAtPath(this.element, '["p:nvSpPr"][0]["p:nvPr"][0]["p:ph"][0]["$"]["type"]');
            if (SUPPORTED_PLACEHOLDERS.includes(type) === false) {
                return true;
            }
        }

        return false;
    }

    public isPlaceholderListElement(): boolean {
        return (
            this.slideLayoutSpNode !== undefined &&
            checkPath(this.slideLayoutSpNode, '["p:txBody"][0]["a:p"][0]["a:pPr"][0]["$"]["lvl"]') &&
            checkPath(this.slideLayoutSpNode, '["p:txBody"][0]["a:lstStyle"][0]["a:lvl1pPr"][0]["a:buNone"]') === false
        );
    }

    public setLayoutSpNodes(slideLayoutTables, slideMasterTables, nodeName) {
        const idx = getValueAtPath(this.element, `["${nodeName}"][0]["p:nvPr"][0]["p:ph"][0]["$"]["idx"]`);
        const type = getValueAtPath(this.element, `["${nodeName}"][0]["p:nvPr"][0]["p:ph"][0]["$"]["type"]`);

        if (type !== undefined) {
            this.slideLayoutSpNode = slideLayoutTables["typeTable"][type];
            this.slideMasterSpNode = slideMasterTables["typeTable"][type];

            return;
        }
        if (idx !== undefined) {
            this.slideLayoutSpNode = slideLayoutTables["idxTable"][idx];
            this.slideMasterSpNode = slideMasterTables["idxTable"][idx];
        }
    }

    public getXfrmNodePosition(xfrmNode) {
        const position: PowerpointElement["elementPosition"] = getValueAtPath(xfrmNode, '["a:off"][0]["$"]');
        const offset: PowerpointElement["elementOffsetPosition"] = getValueAtPath(xfrmNode, '["a:ext"][0]["$"]');

        return { position, offset };
    }

    public getPosition() {
        const xfrmNodePath = '["p:spPr"][0]["a:xfrm"][0]';
        const slideXfrmNode = getValueAtPath(this.element, xfrmNodePath);

        if (slideXfrmNode) {
            return this.getXfrmNodePosition(slideXfrmNode);
        }

        const slideLayoutXfrmNode = getValueAtPath(this.slideLayoutSpNode, xfrmNodePath);
        if (slideLayoutXfrmNode) {
            return this.getXfrmNodePosition(slideLayoutXfrmNode);
        }

        const slideMasterXfrmNode = getValueAtPath(this.slideMasterSpNode, xfrmNodePath);
        if (slideMasterXfrmNode) {
            return this.getXfrmNodePosition(slideMasterXfrmNode);
        }

        return { position: null, offset: null };
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
            const specialityType = ShapeParser.determineSpecialityType(this.element);

            //throwout unsupported content: for example charts, graphs etc
            if (specialityType === SpecialityType.None) {
                return null;
            }

            const nodeName = ELEMENTS_ROOT_NODE[specialityType];
            this.setLayoutSpNodes(slideLayoutTables, slideMasterTables, nodeName);

            if (this.isNonSupportedPlaceholder()) {
                return null;
            }

            const elementName =
                this.element[nodeName][0]["p:cNvPr"][0]["$"]["title"] ||
                this.element[nodeName][0]["p:cNvPr"][0]["$"]["name"].replace(/\s/g, "");

            const { position, offset } = this.getPosition();

            let table = null;
            if (specialityType === SpecialityType.Table) {
                table = GraphicFrameParser.extractTableElements(this.element);
            }

            const elementPresetType =
                getValueAtPath(this.element, '["p:spPr"][0]["a:prstGeom"][0]["$"]["prst"]') || "none";

            const paragraphInfo = getValueAtPath(this.element, '["p:txBody"][0]["a:p"]');
            const isPlaceholderList = this.isPlaceholderListElement();

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
                paragraph: ParagraphParser.extractParagraphElements(paragraphInfo, isPlaceholderList),
                shape: ShapeParser.extractShapeElements(this.element),
                links: SlideRelationsParser.resolveShapeHyperlinks(this.element)
            };

            //throwout paragraph elements which are empty e.g shapes with no text
            if (specialityType === SpecialityType.Paragraph && isEmpty(pptElement.paragraph)) {
                return null;
            }

            pptElement = cleanupJson(pptElement);

            return pptElement;
        } catch (e) {
            console.warn("ERR could not parse element:", e);

            return null; //skip the element
        }
    }
}

export default PowerpointElementParser;
