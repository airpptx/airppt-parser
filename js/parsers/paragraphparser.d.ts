import { PowerpointElement, FontAttributes } from "airppt-models/pptelement";
/**
 * Parse the paragraph elements
 */
export default class ParagraphParser {
    static extractParagraphElements(textElement: any): PowerpointElement["paragraph"];
    /**a:rPr */
    static determineTextProperties(textProperties: any): PowerpointElement["paragraph"]["textCharacterProperties"];
    /**a:pPr */
    static determineParagraphProperties(paragraphProperties: any): PowerpointElement["paragraph"]["paragraphProperties"];
    /** Parse for italics, bold, underline */
    static determineFontAttributes(attributesList: any): FontAttributes[];
    private static ConcatenateParagraphLines;
}
