import { PowerpointElement, FontAttributes, Paragraph, Content } from "airppt-models/pptelement";
/**
 * Parse the paragraph elements
 */
export default class ParagraphParser {
    static extractParagraphElements(paragraphs: any[]): PowerpointElement["paragraph"];
    /**a:rPr */
    static determineTextProperties(textProperties: any): Content["textCharacterProperties"];
    /** Parse for italics, bold, underline & strike through*/
    static determineFontAttributes(attributesList: any): FontAttributes[];
    /**a:pPr */
    static determineParagraphProperties(paragraphProperties: any): Paragraph["paragraphProperties"];
}
