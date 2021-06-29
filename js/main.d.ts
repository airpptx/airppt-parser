import { PowerpointDetails } from "airppt-models/pptdetails";
export declare class AirParser {
    private PowerpointFilePath;
    constructor(PowerpointFilePath: string);
    ParsePowerPoint(slideNumber: number): Promise<PowerpointDetails>;
    private getSlideElements;
}
