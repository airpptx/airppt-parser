import * as format from "string-template";
import { getAttributeByPath, ZipHandler } from "../helpers";
import { GraphicFrameParser, PowerpointElementParser } from "./";

export default class SlideParser {

    public static async getSlideLayout(slideRelations) {
        // Read relationship filename of the slide (Get slideLayoutXX.xml)
        // @sldFileName: ppt/slides/slide1.xml
        // @resName: ppt/slides/_rels/slide1.xml.rels
        let relationshipArray = slideRelations["Relationships"]["Relationship"];
        let layoutFilename = "";
        if (relationshipArray.constructor === Array) {
            for (const relationship of relationshipArray) {
                if (
                    relationship["$"]["Type"] ===
                    "http://schemas.openxmlformats.org/officeDocument/2006/relationships/slideLayout"
                ) {
                    layoutFilename = relationship["$"]["Target"].replace("../", "ppt/");
                    break;
                }
            }
        } else {
            layoutFilename = relationshipArray["$"]["Target"].replace("../", "ppt/");
        }
        // Open slideLayoutXX.xml
        const slideLayoutContent = await ZipHandler.parseSlideAttributes(layoutFilename);

        // Read slide master filename of the slidelayout (Get slideMasterXX.xml)
        // @resName: ppt/slideLayouts/slideLayout1.xml
        // @masterName: ppt/slideLayouts/_rels/slideLayout1.xml.rels
        const slideLayoutResFilename =
            layoutFilename.replace("slideLayouts/slideLayout", "slideLayouts/_rels/slideLayout") +
            ".rels";
        const slideLayoutResContent = await ZipHandler.parseSlideAttributes(slideLayoutResFilename);
        relationshipArray = slideLayoutResContent["Relationships"]["Relationship"];
        let masterFilename = "";
        if (relationshipArray.constructor === Array) {
            for (const relationship of relationshipArray) {
                if (
                    relationship["$"]["Type"] ===
                    "http://schemas.openxmlformats.org/officeDocument/2006/relationships/slideMaster"
                ) {
                    masterFilename = relationship["$"]["Target"].replace("../", "ppt/");
                    break;
                }
            }
        } else {
            masterFilename = relationshipArray["$"]["Target"].replace("../", "ppt/");
        }
        // Open slideMasterXX.xml
        const slideMasterContent = await ZipHandler.parseSlideAttributes(masterFilename);

        return {
            slideLayoutTable: this.indexNodes(slideLayoutContent),
            slideMasterTables: this.indexNodes(slideMasterContent)
        };
    }

    public static indexNodes(content) {
        try {
            const keys = Object.keys(content);
            const spTreeNode = content[keys[0]]["p:cSld"][0]["p:spTree"][0];

            const idTable = {};
            const idxTable = {};
            const typeTable = {};

            for (const key in spTreeNode) {
                if (key !== "p:sp") {
                    continue;
                }

                var targetNode = spTreeNode[key];

                if (targetNode.constructor === Array) {
                    for (const node of targetNode) {
                        const nvSpPrNode = node["p:nvSpPr"];
                        const id = getAttributeByPath(nvSpPrNode[0], ["p:cNvPr", "$", "id"]);
                        const idx = getAttributeByPath(nvSpPrNode[0], [
                            "p:nvPr",
                            "p:ph",
                            "$",
                            "idx"
                        ]);
                        const type = getAttributeByPath(nvSpPrNode[0], [
                            "p:nvPr",
                            "p:ph",
                            "$",
                            "type"
                        ]);

                        if (id !== undefined) {
                            idTable[id] = node;
                        }
                        if (idx !== undefined) {
                            idxTable[idx] = node;
                        }
                        if (type !== undefined) {
                            typeTable[type] = node;
                        }
                    }
                } else {
                    const nvSpPrNode = targetNode["p:nvSpPr"];
                    const id = getAttributeByPath(nvSpPrNode[0], ["p:cNvPr", "$", "id"]);
                    const idx = getAttributeByPath(nvSpPrNode[0], ["p:nvPr", "p:ph", "$", "idx"]);
                    const type = getAttributeByPath(nvSpPrNode[0], ["p:nvPr", "p:ph", "$", "type"]);

                    if (id !== undefined) {
                        idTable[id] = targetNode;
                    }
                    if (idx !== undefined) {
                        idxTable[idx] = targetNode;
                    }
                    if (type !== undefined) {
                        typeTable[type] = targetNode;
                    }
                }
            }

            return { idTable: idTable, idxTable: idxTable, typeTable: typeTable };
        } catch (err) {
            console.warn("Error indexing the layout nodes: ", err);
        }
    }

    public static async getSlideElements(
        PPTElementParser: PowerpointElementParser,
        slideNumber
    ): Promise<any[]> {
        //Get all of Slide Shapes and Elements
        const slideAttributes = await ZipHandler.parseSlideAttributes(
            format("ppt/slides/slide{0}.xml", slideNumber)
        );
        //Contains references to links,images and etc on a Slide
        const slideRelations = await ZipHandler.parseSlideAttributes(
            format("ppt/slides/_rels/slide{0}.xml.rels", slideNumber)
        );
        const { slideMasterTables, slideLayoutTable } = await this.getSlideLayout(slideRelations);
        const slideData = slideAttributes["p:sld"]["p:cSld"];

        //@todo: PROBLEM - Layering Order not Preserved, Shapes Render First, Need to fix
        const slideShapes = getAttributeByPath(slideData, ["p:spTree", "p:sp"]);
        const slideImages = getAttributeByPath(slideData, ["p:spTree", "p:pic"]);
        const graphicFrames = getAttributeByPath(slideData, ["p:spTree", "p:graphicFrame"]);
        const slideTables = GraphicFrameParser.processGraphicFrameNodes(graphicFrames);

        const allSlideElements = [...slideShapes, ...slideImages, ...slideTables];
        const allParsedSlideElements = [];

        for (const slideElement of allSlideElements) {
            const pptElement = PPTElementParser.getProcessedElement(slideElement, slideRelations);

            //throwout any undrenderable content
            if (pptElement) {
                allParsedSlideElements.push(pptElement);
            }
        }

        return allParsedSlideElements;
    }
}
