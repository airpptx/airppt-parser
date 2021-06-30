"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const checkobj_1 = require("../helpers/checkobj");
const colorparser_1 = require("./colorparser");
const pptelement_1 = require("airppt-models/pptelement");
/**
 * Parse the paragraph elements
 */
class ParagraphParser {
    static extractParagraphElements(paragraphs) {
        if (!paragraphs || paragraphs.length === 0) {
            return null;
        }
        return paragraphs.map((paragraph) => {
            const textElements = paragraph["a:r"] || [];
            const content = textElements.map((txtElement) => {
                return {
                    text: txtElement["a:t"] || "",
                    textCharacterProperties: this.determineTextProperties(checkobj_1.CheckValidObject(txtElement, '["a:rPr"][0]'))
                };
            });
            return {
                content: content,
                paragraphProperties: this.determineParagraphProperties(paragraph)
            };
        });
    }
    /**a:rPr */
    static determineTextProperties(textProperties) {
        if (!textProperties) {
            return null;
        }
        const textPropertiesElement = {
            size: checkobj_1.CheckValidObject(textProperties, '["$"].sz') || 1200,
            fontAttributes: this.determineFontAttributes(textProperties["$"]),
            font: checkobj_1.CheckValidObject(textProperties, '["a:latin"][0]["$"]["typeface"]') || "Helvetica",
            fillColor: colorparser_1.default.getTextColors(textProperties) || "000000"
        };
        return textPropertiesElement;
    }
    /** Parse for italics, bold, underline & strike through*/
    static determineFontAttributes(attributesList) {
        const attributesArray = [];
        if (!attributesList) {
            return null;
        }
        Object.keys(attributesList).forEach((element) => {
            if (element === pptelement_1.FontAttributes.Bold && attributesList[element] == 1) {
                attributesArray.push(pptelement_1.FontAttributes.Bold);
            }
            if (element === pptelement_1.FontAttributes.Italics && attributesList[element] == 1) {
                attributesArray.push(pptelement_1.FontAttributes.Italics);
            }
            if (element === pptelement_1.FontAttributes.Underline && attributesList[element] != "none") {
                attributesArray.push(pptelement_1.FontAttributes.Underline);
            }
            if (element === pptelement_1.FontAttributes.StrikeThrough && attributesList[element] != "noStrike") {
                attributesArray.push(pptelement_1.FontAttributes.StrikeThrough);
            }
        });
        return attributesArray;
    }
    /**a:pPr */
    static determineParagraphProperties(paragraphProperties) {
        if (!paragraphProperties) {
            return null;
        }
        let alignment = pptelement_1.TextAlignment.Left;
        const alignProps = checkobj_1.CheckValidObject(paragraphProperties, '["a:pPr"][0]["$"]["algn"]');
        if (alignProps) {
            switch (alignProps) {
                case "ctr":
                    alignment = pptelement_1.TextAlignment.Center;
                    break;
                case "l":
                    alignment = pptelement_1.TextAlignment.Left;
                    break;
                case "r":
                    alignment = pptelement_1.TextAlignment.Right;
                    break;
                case "j":
                    alignment = pptelement_1.TextAlignment.Justified;
                    break;
            }
        }
        const paragraphPropertiesElement = {
            alignment
        };
        return paragraphPropertiesElement;
    }
}
exports.default = ParagraphParser;
