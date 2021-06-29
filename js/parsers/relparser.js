"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const checkobj_1 = require("../helpers/checkobj");
const pptelement_1 = require("airppt-models/pptelement");
/**
 * Parse everything that deals with relations such as hyperlinks and local images
 */
class SlideRelationsParser {
    /**
     *
     * @param theme Parsed XML with theme colors
     */
    static setSlideRelations(rels) {
        this.slideRels = rels;
    }
    static resolveShapeHyperlinks(element) {
        let relID = checkobj_1.CheckValidObject(element, '["p:nvSpPr"][0]["p:cNvPr"][0]["a:hlinkClick"][0]["$"]["r:id"]');
        relID = checkobj_1.CheckValidObject(element, '["p:blipFill"][0]["a:blip"][0]["$"]["r:embed"]');
        if (!relID) {
            return null;
        }
        let linkDetails = this.getRelationDetails(relID);
        return linkDetails;
    }
    static getRelationDetails(relID) {
        let relations = this.slideRels["Relationships"]["Relationship"];
        for (var relation of relations) {
            let relationDetails = relation["$"];
            if (relationDetails["Id"] == relID) {
                let linkType = pptelement_1.LinkType.Asset;
                if (relationDetails["TargetMode"] && relationDetails["TargetMode"] === "External") {
                    linkType = pptelement_1.LinkType.External;
                }
                else {
                    linkType = pptelement_1.LinkType.Asset;
                }
                let relElement = {
                    Type: linkType,
                    Uri: relationDetails["Target"].replace("..", "ppt") //update any relative paths
                };
                return relElement;
            }
        }
        return null;
    }
}
exports.default = SlideRelationsParser;
