import { getValueAtPath } from "../helpers";
import { PowerpointElement, LinkType, Content } from "airppt-models-plus/pptelement";

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

    public static resolveShapeHyperlinks(element): PowerpointElement["links"] {
        const relID = getValueAtPath(element, '["p:blipFill"][0]["a:blip"][0]["$"]["r:embed"]');
        if (!relID) {
            return null;
        }
        return this.getRelationDetails(relID);
    }

    public static resolveParagraphHyperlink(element): Content["hyperlink"] {
        const relID = getValueAtPath(element, '["a:rPr"][0]["a:hlinkClick"][0]["$"]["r:id"]');
        if (!relID) {
            return null;
        }

        return this.getRelationDetails(relID);
    }

    public static getRelationDetails(relID): PowerpointElement["links"] {
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
