import { getValueAtPath } from "../helpers";
import { PowerpointElement, LinkType, Content, SpecialityType } from "airppt-models-plus/pptelement";

/**
 * Parse everything that deals with relations such as hyperlinks and local images
 */
export default class SlideRelationsParser {
    static slideRels;
    /**
     *
     * @param theme Parsed XML with theme colors
     */
    public static setSlideRelations(rels) {
        this.slideRels = rels;
    }

    public static resolveShapeHyperlinks(element, specialityType): PowerpointElement["links"] {
        let relID;
        switch (specialityType) {
            case SpecialityType.Audio:
                relID = getValueAtPath(element, '["p:nvPicPr"][0]["p:nvPr"][0]["a:audioFile"][0]["$"]["r:link"]');

                return this.getRelationDetails(relID);

            case SpecialityType.Video:
                relID = getValueAtPath(element, '["p:nvPicPr"][0]["p:nvPr"][0]["a:videoFile"][0]["$"]["r:link"]');

                return this.getRelationDetails(relID);

            default:
                relID = getValueAtPath(element, '["p:blipFill"][0]["a:blip"][0]["$"]["r:embed"]');

                return this.getRelationDetails(relID);
        }
    }

    public static resolveParagraphHyperlink(element): Content["hyperlink"] {
        const relID = getValueAtPath(element, '["a:rPr"][0]["a:hlinkClick"][0]["$"]["r:id"]');
        if (!relID) {
            return null;
        }

        return this.getRelationDetails(relID);
    }

    public static getRelationDetails(relID): PowerpointElement["links"] {
        if (!relID) {
            return null;
        }
        const relations = this.slideRels["Relationships"]["Relationship"];
        for (var relation of relations) {
            const relationDetails = relation["$"];
            if (relationDetails["Id"] == relID) {
                let linkType: LinkType;
                if (relationDetails["TargetMode"] && relationDetails["TargetMode"] === "External") {
                    linkType = LinkType.External;
                } else {
                    linkType = LinkType.Asset;
                }

                return {
                    Type: linkType,
                    Uri: relationDetails["Target"].replace("..", "ppt") //update any relative paths
                };
            }
        }

        return null;
    }
}
