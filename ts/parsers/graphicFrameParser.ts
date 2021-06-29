//Graphic frame node includes tables, charts and diagrams

import { getAttributeByPath } from "../helpers/attributesHandler";

export default class GraphicFrameParser {
    public static processGraphicFrameNodes = (graphicFrames) => {
        const result = [];

        for (const frame of graphicFrames) {
            const graphicTypeUri = getAttributeByPath([frame], ["a:graphic", "a:graphicData", "$", "uri"]);

            switch (graphicTypeUri) {
                case "http://schemas.openxmlformats.org/drawingml/2006/table":
                    result.push(frame);
                    break;
                case "http://schemas.openxmlformats.org/drawingml/2006/chart":
                    break;
                case "http://schemas.openxmlformats.org/drawingml/2006/diagram":
                    break;
                default:
            }
        }

        return result;
    };

    public static extractTableElements = (frame) => {
        const rawTable = getAttributeByPath([frame], ["a:graphic", "a:graphicData", "a:tbl"]);
        const rawRows = rawTable[0]["a:tr"] ? rawTable[0]["a:tr"] : [];

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
                let meta = {};
                if (col["$"]) {
                    if (col["$"]["rowSpan"]) {
                        meta["rowSpan"] = col["$"]["rowSpan"];
                    }
                    if (col["$"]["gridSpan"]) {
                        meta["colSpan"] = col["$"]["gridSpan"];
                    }
                }

                //TODO: check if the text can have multiple values in an array, by default have seen only one so far
                // hence getting 0th index
                const textContent = getAttributeByPath([col], ["a:txBody", "a:p", "a:r", "a:t"])[0] || "";
                return {
                    //raw data doesn't have a property of text if the cell is empty, therefore we return an empty string
                    text: typeof textContent === "string" ? textContent : "",
                    meta
                };
            });

            return {
                cols: cols
            };
        });

        //TODO: return any other possible and helpful table info
        return {
            rows: tableRows
        };
    };
}
