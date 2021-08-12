//Graphic frame node includes tables, charts and diagrams

import { getAttributeByPath, getValueAtPath } from "../helpers";
import * as isEmpty from "lodash.isempty";
import { TableDesign } from "airppt-models-plus/pptelement";
import { ParagraphParser } from "./";
import { SCHEMAS_URI } from "../utils/constants";

export default class GraphicFrameParser {
    public static processGraphicFrameNodes = (graphicFrames) => {
        const result = [];

        for (const frame of graphicFrames) {
            const graphicTypeUri = getAttributeByPath([frame], ["a:graphic", "a:graphicData", "$", "uri"]);

            switch (graphicTypeUri) {
                case SCHEMAS_URI.TABLE:
                    result.push(frame);
                    break;
                case SCHEMAS_URI.CHART:
                    break;
                case SCHEMAS_URI.DIAGRAM:
                    break;
                default:
            }
        }

        return result;
    };

    static getTableDesigns = (table: any[]): string[] => {
        const allDesigns = getAttributeByPath(table, ["a:tblPr", "$"]);
        const tableDesigns = [];
        if (!isEmpty(allDesigns)) {
            for (const supportedDesign of Object.values(TableDesign)) {
                if (allDesigns[supportedDesign]) {
                    tableDesigns.push(supportedDesign);
                }
            }
        }

        return tableDesigns;
    };

    public static extractTableElements = (frame) => {
        const rawTable = getAttributeByPath([frame], ["a:graphic", "a:graphicData", "a:tbl"], []);

        if (rawTable.length === 0) {
            return null;
        }
        const rawRows = rawTable[0]["a:tr"] ? rawTable[0]["a:tr"] : [];

        //TODO: column width mapping to be done here using rawTable[a:tblGrid]
        const tableRows = rawRows.map((row) => {
            let cols = row["a:tc"] ? row["a:tc"] : [];
            cols = cols.filter((col) => {
                //filtering the columns that are merge columns or merge rows. as we still get them in raw data
                if (col["$"] && (col["$"]["vMerge"] || col["$"]["hMerge"])) {
                    return false;
                }

                return true;
            });

            cols = cols.map((col) => {
                const meta = {};
                if (col["$"]) {
                    if (col["$"]["rowSpan"]) {
                        meta["rowSpan"] = col["$"]["rowSpan"];
                    }
                    if (col["$"]["gridSpan"]) {
                        meta["colSpan"] = col["$"]["gridSpan"];
                    }
                }

                const paragraphInfo = getValueAtPath(col, '["a:txBody"][0]["a:p"]');
                let parsedParagraph = ParagraphParser.extractParagraphElements(paragraphInfo, false);
                //edge case to handle the empty cell, without this check it will be sent as { paragraph: { content: [], ....}}
                //and that is considered as line break in our renderer
                if (parsedParagraph.length === 1 && isEmpty(parsedParagraph[0].content)) {
                    parsedParagraph = [];
                }

                return {
                    paragraph: parsedParagraph,
                    meta
                };
            });

            return {
                cols: cols
            };
        });

        return {
            tableDesign: GraphicFrameParser.getTableDesigns(rawTable),
            rows: tableRows
        };
    };
}
