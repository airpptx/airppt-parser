import { join } from "path";
import * as format from "string-template";
import { GROUPS_LIMIT, SCHEMAS_URI } from "../utils/constants";
import { getAttributeByPath, FileHandler } from "../helpers";
import { GraphicFrameParser, PowerpointElementParser } from "./";

export default class SlideParser {
    public static async getSlideLayout(slideRelations, pptFilePath) {
        // Read relationship filename of the slide (Get slideLayoutXX.xml)
        // @sldFileName: ppt/slides/slide1.xml
        // @resName: ppt/slides/_rels/slide1.xml.rels
        let relationshipArray = slideRelations["Relationships"]["Relationship"];
        let layoutFilename = "";
        if (Array.isArray(relationshipArray)) {
            for (const relationship of relationshipArray) {
                if (relationship["$"]["Type"] === SCHEMAS_URI.SLIDE_LAYOUT) {
                    layoutFilename = relationship["$"]["Target"].replace("../", "ppt/");
                    break;
                }
            }
        } else {
            layoutFilename = relationshipArray["$"]["Target"].replace("../", "ppt/");
        }
        // Open slideLayoutXX.xml
        const slideLayoutContent = await FileHandler.parseContentFromFile(join(pptFilePath, layoutFilename));

        // Read slide master filename of the slidelayout (Get slideMasterXX.xml)
        // @resName: ppt/slideLayouts/slideLayout1.xml
        // @masterName: ppt/slideLayouts/_rels/slideLayout1.xml.rels
        const slideLayoutResFilename =
            layoutFilename.replace("slideLayouts/slideLayout", "slideLayouts/_rels/slideLayout") + ".rels";
        const slideLayoutResContent = await FileHandler.parseContentFromFile(join(pptFilePath, slideLayoutResFilename));
        relationshipArray = slideLayoutResContent["Relationships"]["Relationship"];
        let masterFilename = "";
        if (Array.isArray(relationshipArray)) {
            for (const relationship of relationshipArray) {
                if (relationship["$"]["Type"] === SCHEMAS_URI.SLIDE_MASTER) {
                    masterFilename = relationship["$"]["Target"].replace("../", "ppt/");
                    break;
                }
            }
        } else {
            masterFilename = relationshipArray["$"]["Target"].replace("../", "ppt/");
        }
        // Open slideMasterXX.xml
        const slideMasterContent = await FileHandler.parseContentFromFile(join(pptFilePath, masterFilename));

        return {
            slideLayoutTables: this.indexNodes(slideLayoutContent),
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

                if (Array.isArray(targetNode)) {
                    for (const node of targetNode) {
                        const nvSpPrNode = node["p:nvSpPr"];
                        const id = getAttributeByPath(nvSpPrNode, ["p:cNvPr", "$", "id"]);
                        const idx = getAttributeByPath(nvSpPrNode, ["p:nvPr", "p:ph", "$", "idx"]);
                        const type = getAttributeByPath(nvSpPrNode, ["p:nvPr", "p:ph", "$", "type"]);

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
                    const id = getAttributeByPath(nvSpPrNode, ["p:cNvPr", "$", "id"]);
                    const idx = getAttributeByPath(nvSpPrNode, ["p:nvPr", "p:ph", "$", "idx"]);
                    const type = getAttributeByPath(nvSpPrNode, ["p:nvPr", "p:ph", "$", "type"]);

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

    public static getGroupedNodes(rootGroupNode, groupCount = 0, groupedShapes = [], groupedImages = []) {
        groupCount++;
        if (rootGroupNode["p:sp"]) {
            groupedShapes.push(...rootGroupNode["p:sp"]);
        }
        if (rootGroupNode["p:pic"]) {
            groupedImages.push(...rootGroupNode["p:pic"]);
        }
        const subGroups = rootGroupNode["p:grpSp"];
        if (subGroups && Array.isArray(subGroups) && groupCount <= GROUPS_LIMIT) {
            subGroups.forEach((subGroup) => {
                this.getGroupedNodes(subGroup, groupCount, groupedShapes, groupedImages);
            });
        }

        return { groupedShapes, groupedImages };
    }

    public static async getSlideElements(
        PPTElementParser: PowerpointElementParser,
        slideNumber,
        pptFilePath: string
    ): Promise<any[]> {
        try {
            //Get all of Slide Shapes and Elements
            const slideAttributes = await FileHandler.parseContentFromFile(
                join(pptFilePath, format("ppt/slides/slide{0}.xml", slideNumber))
            );
            //Contains references to links,images, audios, videos etc on a Slide
            const slideRelations = await FileHandler.parseContentFromFile(
                join(pptFilePath, format("ppt/slides/_rels/slide{0}.xml.rels", slideNumber))
            );
            const { slideMasterTables, slideLayoutTables } = await this.getSlideLayout(slideRelations, pptFilePath);
            const slideData = slideAttributes["p:sld"]["p:cSld"];
            const slideShapes = getAttributeByPath(slideData, ["p:spTree", "p:sp"], []);
            const slideImages = getAttributeByPath(slideData, ["p:spTree", "p:pic"], []);
            const graphicFrames = getAttributeByPath(slideData, ["p:spTree", "p:graphicFrame"], []);

            const groupedContent = getAttributeByPath(slideData, ["p:spTree", "p:grpSp"], []);
            groupedContent.forEach((group) => {
                const { groupedShapes, groupedImages } = this.getGroupedNodes(group);
                slideShapes.push(...groupedShapes);
                slideImages.push(...groupedImages);
            });

            const slideTables = GraphicFrameParser.processGraphicFrameNodes(graphicFrames);

            const allSlideElements = [...slideShapes, ...slideImages, ...slideTables];
            const allParsedSlideElements = [];

            for (const slideElement of allSlideElements) {
                const pptElement = PPTElementParser.getProcessedElement(
                    slideElement,
                    slideLayoutTables,
                    slideMasterTables,
                    slideRelations
                );

                //throwout any undrenderable content
                if (pptElement) {
                    allParsedSlideElements.push(pptElement);
                }
            }

            return allParsedSlideElements;
        } catch (error) {
            throw error;
        }
    }
}
