import { PowerpointElement } from "airppt-models/pptelement";
/**
 * Entry point for all Parsers
 */
declare class PowerpointElementParser {
    private element;
    getProcessedElement(rawElement: any, slideRelationships: any): PowerpointElement;
}
export default PowerpointElementParser;
