"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const checkobj_1 = require("../helpers/checkobj");
const colorparser_1 = require("./colorparser");
const pptelement_1 = require("airppt-models/pptelement");
/**
 * Parse the paragraph elements
 */
class ParagraphParser {
    static extractParagraphElements(textElement) {
        if (!textElement || !textElement["a:r"]) {
            return null;
        }
        let pptTextElement = {
            text: this.ConcatenateParagraphLines(textElement["a:r"]) || "",
            textCharacterProperties: this.determineTextProperties(checkobj_1.CheckValidObject(textElement, '["a:r"][0]["a:rPr"][0]')),
            paragraphProperties: this.determineParagraphProperties(textElement)
        };
        return pptTextElement;
    }
    /**a:rPr */
    static determineTextProperties(textProperties) {
        if (!textProperties) {
            return null;
        }
        let textPropertiesElement = {
            size: checkobj_1.CheckValidObject(textProperties, '["$"].sz') || 1200,
            fontAttributes: this.determineFontAttributes(textProperties["$"]),
            font: checkobj_1.CheckValidObject(textProperties, '["a:latin"][0]["$"]["typeface"]') || "Helvetica",
            fillColor: colorparser_1.default.getTextColors(textProperties) || "000000"
        };
        return textPropertiesElement;
    }
    /**a:pPr */
    static determineParagraphProperties(paragraphProperties) {
        if (!paragraphProperties) {
            return null;
        }
        let alignment = pptelement_1.TextAlignment.Left;
        let alignProps = checkobj_1.CheckValidObject(paragraphProperties, '["a:pPr"][0]["$"]["algn"]');
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
        console.log("align", alignment);
        let paragraphPropertiesElement = {
            alignment
        };
        return paragraphPropertiesElement;
    }
    /** Parse for italics, bold, underline */
    static determineFontAttributes(attributesList) {
        let attributesArray = [];
        if (!attributesList) {
            return null;
        }
        Object.keys(attributesList).forEach((element) => {
            if (element == "b" && attributesList[element] == 1) {
                attributesArray.push(pptelement_1.FontAttributes.Bold);
            }
            if (element == "i" && attributesList[element] == 1) {
                attributesArray.push(pptelement_1.FontAttributes.Italics);
            }
            if (element == "u" && attributesList[element] == 1) {
                attributesArray.push(pptelement_1.FontAttributes.Underline);
            }
            if (element == "s" && attributesList[element] == 1) {
                attributesArray.push(pptelement_1.FontAttributes.StrikeThrough);
            }
        });
        return attributesArray;
    }
    /*["a:r"]*/
    static ConcatenateParagraphLines(lines) {
        if (!lines) {
            return null;
        }
        let text = [];
        for (var i in lines) {
            text.push(lines[i]["a:t"]);
        }
        return text.join(" ");
    }
}
exports.default = ParagraphParser;
