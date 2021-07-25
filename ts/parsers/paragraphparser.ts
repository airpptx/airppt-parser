import { ColorParser, SlideRelationsParser } from "./";
import { checkPath, getValueAtPath } from "../helpers";

import {
    PowerpointElement,
    TextAlignment,
    FontAttributes,
    Paragraph,
    Content,
    List,
    ListType
} from "airppt-models-plus/pptelement";

/**
 * Parse the paragraph elements
 */
export default class ParagraphParser {
    //Merge consecutive text content blocks together which have same hyperlinks
    //and also adjust the spacing in between the hyperlink for the edge cases
    public static restructureContents(contents: Content[]): Content[] {
        for (let i = 0; i < contents.length - 1; i++) {
            if (
                contents[i].hyperlink &&
                contents[i + 1].hyperlink &&
                contents[i].hyperlink.Uri === contents[i + 1].hyperlink.Uri
            ) {
                if (
                    contents[i].text[0].trimEnd().length === contents[i].text[0].length &&
                    contents[i + 1].text[0].trimStart().length === contents[i + 1].text[0].length
                ) {
                    contents[i].text[0] += " " + contents[i + 1].text[0];
                } else {
                    contents[i].text[0] += contents[i + 1].text[0];
                }
                contents.splice(i + 1, 1);
                i--;
            }
        }

        return contents;
    }

    public static isList(paragraph): boolean {
        return (
            checkPath(paragraph, '["a:pPr"][0]["a:buAutoNum"]') ||
            checkPath(paragraph, '["a:pPr"][0]["a:buChar"]')
        );
    }

    public static getParagraph(paragraph): Paragraph {
        const textElements = paragraph["a:r"] || [];
        let contents = textElements.map((txtElement) => {
            const content: Content = {
                text: txtElement["a:t"] || "",
                textCharacterProperties: this.determineTextProperties(
                    getValueAtPath(txtElement, '["a:rPr"][0]')
                )
            };

            const hyperlink = SlideRelationsParser.resolveParagraphHyperlink(txtElement);
            if (hyperlink) {
                content.hyperlink = hyperlink;
            }

            return content;
        });

        contents = this.restructureContents(contents);

        return {
            content: contents,
            paragraphProperties: this.determineParagraphProperties(paragraph)
        };
    }

    public static getListlevel(paragraph): number {
        const level = getValueAtPath(paragraph, '["a:pPr"][0]["$"]["lvl"]');

        return level ? parseInt(level) : 0;
    }

    public static getListType(paragraph): ListType {
        if (checkPath(paragraph, '["a:pPr"][0]["a:buAutoNum"]')) {
            return ListType.Ordered;
        }

        return ListType.UnOrdered;
    }

    //recursively iterate the list and restructure it to have a parent child relation
    public static restructureList(list: List): List {
        //if we keep finding the empty list at top level keep going deeper.
        //Note: before restructuring, list items and paragraph content didn't exist in the same object
        if (list.listItems.length === 1 && list.listItems[0].list) {
            this.restructureList(list.listItems[0].list);
        }
        for (let i = 0; i < list.listItems.length - 1; i++) {
            //if any of the element is list, keep going going deeper into the list
            if (list.listItems[i].list) {
                this.restructureList(list.listItems[i].list);
            }
            //if the next item to the content is a list, make that list child of the content
            if (list.listItems[i + 1].list) {
                list.listItems[i]["list"] = list.listItems[i + 1].list;
                list.listItems.splice(i + 1, 1);
                i--;
            }
        }
        return list;
    }

    public static extractParagraphElements(paragraphs: any[]): PowerpointElement["paragraph"] {
        if (!paragraphs || paragraphs.length === 0) {
            return null;
        }

        const allParagraphs = [];
        const stack = [];
        const paragraph: Paragraph = {
            list: {
                listType: ListType.Ordered,
                listItems: []
            }
        };
        let currentParagraph = paragraph;
        let currentLevel = -1;

        for (const paragraphItem of paragraphs) {
            if (this.isList(paragraphItem)) {
                const listLevel = this.getListlevel(paragraphItem);

                // if its the first of the list kind
                if (currentLevel === -1) {
                    while (currentLevel < listLevel - 1) {
                        const emptyParagraph: Paragraph = {
                            list: {
                                listType: ListType.UnOrdered,
                                listItems: []
                            }
                        };
                        currentParagraph.list.listItems.push(emptyParagraph);
                        currentParagraph = emptyParagraph;
                        //pushing it in the stack to keep track of the parents
                        stack.push(emptyParagraph);
                        currentLevel++;
                    }
                    currentParagraph.list.listType = this.getListType(paragraphItem);
                    currentParagraph.list.listItems.push(this.getParagraph(paragraphItem));
                    stack.push(currentParagraph);
                    currentLevel++;
                }
                //if the level is same keep pushing the list items in the same array
                else if (listLevel === currentLevel) {
                    currentParagraph.list.listItems.push(this.getParagraph(paragraphItem));
                } else if (listLevel > currentLevel) {
                    //edge case to handle if multiple levels are jumped ahead
                    //create empty paragraphs/lists to maintain hierarchy and fill in the level gaps
                    while (currentLevel < listLevel - 1) {
                        const emptyParagraph: Paragraph = {
                            list: {
                                listType: ListType.UnOrdered,
                                listItems: []
                            }
                        };
                        currentParagraph.list.listItems.push(emptyParagraph);
                        currentParagraph = emptyParagraph;
                        //pushing it in the stack to keep track of the parents
                        stack.push(emptyParagraph);
                        currentLevel++;
                    }
                    //if there is another hierarchy starting create a new list for it
                    const newParagraph: Paragraph = {
                        list: {
                            listType: this.getListType(paragraphItem),
                            listItems: [this.getParagraph(paragraphItem)]
                        }
                    };
                    currentParagraph.list.listItems.push(newParagraph);
                    currentParagraph = newParagraph;
                    //pushing it in the stack to keep track of the parents
                    stack.push(newParagraph);
                    currentLevel++;
                } else {
                    //if we find the list level lower than current level
                    //keep going back in stack until the same level parent is found
                    while (currentLevel > listLevel) {
                        stack.pop();
                        currentLevel--;
                    }
                    //and push the new item as a sibling
                    currentParagraph = stack[stack.length - 1];
                    currentParagraph.list.listItems.push(this.getParagraph(paragraphItem));
                }
            } else {
                //if the paragraph was not a list item
                //check if we previously had the list items then push the list in paragraphs
                if (paragraph.list.listItems.length > 0) {
                    paragraph.list = this.restructureList(paragraph.list);
                    allParagraphs.push(paragraph);
                    paragraph.list.listItems = [];
                }
                allParagraphs.push(this.getParagraph(paragraphItem));
            }
        }
        //true if there were only list items in the text box, push them
        if (paragraph.list.listItems.length > 0) {
            paragraph.list = this.restructureList(paragraph.list);
            allParagraphs.push(paragraph);
        }

        return allParagraphs;
    }

    /**a:rPr */
    public static determineTextProperties(textProperties): Content["textCharacterProperties"] {
        if (!textProperties) {
            return null;
        }

        const textPropertiesElement: Content["textCharacterProperties"] = {
            size: getValueAtPath(textProperties, '["$"].sz') || 1200,
            fontAttributes: this.determineFontAttributes(textProperties["$"]),
            font: getValueAtPath(textProperties, '["a:latin"][0]["$"]["typeface"]') || "Helvetica",
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
    public static determineParagraphProperties(
        paragraphProperties
    ): Paragraph["paragraphProperties"] {
        if (!paragraphProperties) {
            return null;
        }

        let alignment: TextAlignment = TextAlignment.Left;

        const alignProps = getValueAtPath(paragraphProperties, '["a:pPr"][0]["$"]["algn"]');

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
