require("module-alias/register");
import ZipHandler from "@helpers/ziphandler";
import PowerpointElementParser from "./parsers/elementparser";
import * as format from "string-template";
import { PowerpointElement } from "@models/pptelement";

class AirParser {
	constructor(private PowerpointFilePath: string, private slideNumber: number) {}

	public async ParsePowerPoint(): Promise<PowerpointElement[]> {
		//open Powerpoint File
		await ZipHandler.loadZip(this.PowerpointFilePath);
		let slideShowGlobals = await ZipHandler.parseSlideAttributes("ppt/presentation.xml");
		let slideShowTheme = await ZipHandler.parseSlideAttributes("ppt/theme/theme1.xml");
		let pptElementParser = new PowerpointElementParser(slideShowGlobals, slideShowTheme);
		//only get slideAttributes for one slide and return as array
		let parsedSlideElements = await this.getSlideElements(pptElementParser, this.slideNumber);
		return parsedSlideElements;

		//TO-DO: Parse All Slides by Default
	}

	private async getSlideElements(PPTElementParser: PowerpointElementParser, slideNumber) {
		//Get all of Slide Shapes and Elements
		let slideAttributes = await ZipHandler.parseSlideAttributes(format("ppt/slides/slide{0}.xml", slideNumber));
		//Contains references to links,images and etc on a Slide
		let slideRelations = await ZipHandler.parseSlideAttributes(format("ppt/slides/_rels/slide{0}.xml.rels", slideNumber));

		//PROBLEM: ORDERING NOT PRESERVED, SHAPES RENDER FIRST
		let slideShapes = slideAttributes["p:sld"]["p:cSld"][0]["p:spTree"][0]["p:sp"] || [];
		let slideImages = slideAttributes["p:sld"]["p:cSld"][0]["p:spTree"][0]["p:pic"] || [];

		let allSlideElements = slideShapes.concat(slideImages);
		let allParsedSlideElements = [];
		for (let slideElement of allSlideElements) {
			let pptElement = PPTElementParser.getProcessedElement(slideElement, slideRelations);
			allParsedSlideElements.push(pptElement);
		}

		return allParsedSlideElements;
	}
}

export default AirParser;
