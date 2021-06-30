import { PowerpointDetails } from "airppt-models-plus/pptdetails";
export declare class AirParser {
    private PowerpointFilePath;
    constructor(PowerpointFilePath: string);
    ParsePowerPoint(slideNumber: number): Promise<PowerpointDetails>;
    private getSlideElements;
}
