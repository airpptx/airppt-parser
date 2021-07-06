//require("module-alias/register");
import PowerpointElementParser from "./parsers/elementparser";
import { PowerpointDetails } from "airppt-models-plus/pptdetails";
import SlideParser from "./parsers/slideParser";
import PptGlobalsParser from "./parsers/pptGlobalsParser";

export class AirParser {
    constructor(private readonly PowerpointFilePath: string) {}

    public async ParsePowerPoint(): Promise<PowerpointDetails> {
        return new Promise<PowerpointDetails>(async (resolve, reject) => {
            const pptElementParser = new PowerpointElementParser();
            const slidesLength = await PptGlobalsParser.getSlidesLength(this.PowerpointFilePath);
            const allSlides = [];

            for (let i = 1; i <= slidesLength + 1; i++) {
                allSlides.push(SlideParser.getSlideElements(pptElementParser, i));
            }

            Promise.allSettled(allSlides)
                .then((result) => {
                    const pptElements = result.map((slideElements) => {
                        if (slideElements.status === "fulfilled") {
                            return slideElements.value;
                        }

                        return [];
                    });

                    resolve({
                        powerPointElements: pptElements,
                        inputPath: this.PowerpointFilePath,
                        slidesLength
                    });
                })
            ;
        });
    }
}
