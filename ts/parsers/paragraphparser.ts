import { CheckValidObject } from "../helpers/checkobj";
import ColorParser from "./colorparser";

import { PowerpointElement, TextAlignment, FontAttributes, Paragraph, Content } from "airppt-models/pptelement";

/**
 * Parse the paragraph elements
 */
export default class ParagraphParser {
    public static extractParagraphElements(paragraphs: any[]): PowerpointElement["paragraph"] {
        if (!paragraphs || paragraphs.length === 0) {
            return null;
        }

        return paragraphs.map((paragraph) => {
            const textElements = paragraph["a:r"] || [];
            const content = textElements.map((txtElement) => {
                return {
                    text: txtElement["a:t"] || "",
                    textCharacterProperties: this.determineTextProperties(CheckValidObject(txtElement, '["a:rPr"][0]'))
                };
            });

            return {
                content: content,
                paragraphProperties: this.determineParagraphProperties(paragraph)
            };
        });
    }

    /**a:rPr */
    public static determineTextProperties(textProperties): Content["textCharacterProperties"] {
        if (!textProperties) {
            return null;
        }

        const textPropertiesElement: Content["textCharacterProperties"] = {
            size: CheckValidObject(textProperties, '["$"].sz') || 1200,
            fontAttributes: this.determineFontAttributes(textProperties["$"]),
            font: CheckValidObject(textProperties, '["a:latin"][0]["$"]["typeface"]') || "Helvetica",
            fillColor: ColorParser.getTextColors(textProperties) || "000000"
        };

        return textPropertiesElement;
    }

    /** Parse for italics, bold, underline & strike through*/
    public static determineFontAttributes(attributesList): FontAttributes[] {
        const attributesArray: FontAttributes[] = [];
        if (!attributesList) {
            return null;
        }
        Object.keys(attributesList).forEach((element) => {
            if (element === FontAttributes.Bold && attributesList[element] == 1) {
                attributesArray.push(FontAttributes.Bold);
            }
            if (element === FontAttributes.Italics && attributesList[element] == 1) {
                attributesArray.push(FontAttributes.Italics);
            }
            if (element === FontAttributes.Underline && attributesList[element] != "none") {
                attributesArray.push(FontAttributes.Underline);
            }
            if (element === FontAttributes.StrikeThrough && attributesList[element] != "noStrike") {
                attributesArray.push(FontAttributes.StrikeThrough);
            }
        });
        return attributesArray;
    }

    /**a:pPr */
    public static determineParagraphProperties(paragraphProperties): Paragraph["paragraphProperties"] {
        if (!paragraphProperties) {
            return null;
        }

        let alignment: TextAlignment = TextAlignment.Left;

        const alignProps = CheckValidObject(paragraphProperties, '["a:pPr"][0]["$"]["algn"]');

        if (alignProps) {
            switch (alignProps) {
                case "ctr":
                    alignment = TextAlignment.Center;
                    break;
                case "l":
                    alignment = TextAlignment.Left;
                    break;
                case "r":
                    alignment = TextAlignment.Right;
                    break;
                case "j":
                    alignment = TextAlignment.Justified;
                    break;
            }
        }
        const paragraphPropertiesElement: Paragraph["paragraphProperties"] = {
            alignment
        };

        return paragraphPropertiesElement;
    }
}
