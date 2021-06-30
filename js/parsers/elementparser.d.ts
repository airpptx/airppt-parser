import { PowerpointElement } from "airppt-models-plus/pptelement";
/**
 * Entry point for all Parsers
 */
declare class PowerpointElementParser {
    private element;
    getProcessedElement(rawElement: any, slideRelationships: any): PowerpointElement;
}
export default PowerpointElementParser;
