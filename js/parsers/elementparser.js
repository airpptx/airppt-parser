"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const checkobj_1 = require("../helpers/checkobj");
const shapeparser_1 = require("./shapeparser");
const paragraphparser_1 = require("./paragraphparser");
const relparser_1 = require("./relparser");
const graphicFrameParser_1 = require("./graphicFrameParser");
const common_1 = require("../utils/common");
const isEmpty = require("lodash.isempty");
/**
 * Entry point for all Parsers
 */
class PowerpointElementParser {
    getProcessedElement(rawElement, slideRelationships) {
        relparser_1.default.setSlideRelations(slideRelationships);
        try {
            if (!rawElement) {
                return null;
            }
            this.element = rawElement;
            let elementName = "";
            let elementPosition;
            let elementOffsetPosition;
            let table = null;
            let isTitle = false;
            if (this.element["p:nvSpPr"]) {
                elementName =
                    this.element["p:nvSpPr"][0]["p:cNvPr"][0]["$"]["title"] ||
                        this.element["p:nvSpPr"][0]["p:cNvPr"][0]["$"]["name"].replace(/\s/g, "");
                if (checkobj_1.CheckValidObject(this.element, '["p:nvSpPr"][0]["p:nvPr"][0]["p:ph"][0]["$"]["type"]') === "ctrTitle") {
                    isTitle = true;
                }
                //elements must have a position, or else ignore them. TO-DO: Allow Placeholder positions
                if (!isTitle && !this.element["p:spPr"][0]["a:xfrm"]) {
                    return null;
                }
                if (!isTitle) {
                    elementPosition = this.element["p:spPr"][0]["a:xfrm"][0]["a:off"][0]["$"];
                    elementOffsetPosition = this.element["p:spPr"][0]["a:xfrm"][0]["a:ext"][0]["$"];
                }
            }
            else if (this.element["p:nvPicPr"]) {
                //if the element is an image, get basic info like this
                elementName =
                    this.element["p:nvPicPr"][0]["p:cNvPr"][0]["$"]["title"] ||
                        this.element["p:nvPicPr"][0]["p:cNvPr"][0]["$"]["name"].replace(/\s/g, "");
                if (!this.element["p:spPr"][0]["a:xfrm"]) {
                    return null;
                }
                elementPosition = this.element["p:spPr"][0]["a:xfrm"][0]["a:off"][0]["$"];
                elementOffsetPosition = this.element["p:spPr"][0]["a:xfrm"][0]["a:ext"][0]["$"];
            }
            //check only if its the table, in future can be changed it to overall graphic types e.g. diagrams, charts.
            //but for now only doing the tables.
            else if (checkobj_1.CheckValidObject(this.element, '["a:graphic"][0]["a:graphicData"][0]["a:tbl"]')) {
                elementName =
                    this.element["p:nvGraphicFramePr"][0]["p:cNvPr"][0]["$"]["title"] ||
                        this.element["p:nvGraphicFramePr"][0]["p:cNvPr"][0]["$"]["name"].replace(/\s/g, "");
                if (!this.element["p:xfrm"]) {
                    return null;
                }
                elementPosition = this.element["p:xfrm"][0]["a:off"][0]["$"];
                elementOffsetPosition = this.element["p:xfrm"][0]["a:ext"][0]["$"];
                table = graphicFrameParser_1.default.extractTableElements(this.element);
            }
            const elementPresetType = checkobj_1.CheckValidObject(this.element, '["p:spPr"][0]["a:prstGeom"][0]["$"]["prst"]') || "none";
            const paragraphInfo = checkobj_1.CheckValidObject(this.element, '["p:txBody"][0]["a:p"]');
            let pptElement = {
                name: elementName,
                shapeType: shapeparser_1.default.determineShapeType(elementPresetType),
                specialityType: shapeparser_1.default.determineSpecialityType(this.element),
                elementPosition: {
                    x: elementPosition === null || elementPosition === void 0 ? void 0 : elementPosition.x,
                    y: elementPosition === null || elementPosition === void 0 ? void 0 : elementPosition.y
                },
                elementOffsetPosition: {
                    cx: elementOffsetPosition === null || elementOffsetPosition === void 0 ? void 0 : elementOffsetPosition.cx,
                    cy: elementOffsetPosition === null || elementOffsetPosition === void 0 ? void 0 : elementOffsetPosition.cy
                },
                table: !isEmpty(table) && !isEmpty(table.rows) ? table : null,
                paragraph: paragraphparser_1.default.extractParagraphElements(paragraphInfo),
                shape: shapeparser_1.default.extractShapeElements(this.element),
                links: relparser_1.default.resolveShapeHyperlinks(this.element),
                raw: rawElement
            };
            //TODO: remove the raw property from final JSON
            pptElement = common_1.cleanupJson(pptElement);
            return pptElement;
        }
        catch (e) {
            console.warn("ERR could not parse element:", e);
            return null; //skip the element
        }
    }
}
exports.default = PowerpointElementParser;
