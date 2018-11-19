//require("module-alias/register");
import ZipHandler from "./helpers/ziphandler";
import PowerpointElementParser from "./parsers/elementparser";

import { PowerpointDetails } from "airppt-models/pptdetails";
import * as format from "string-template";

export class AirParser {
	constructor(private PowerpointFilePath: string) {}

	public async ParsePowerPoint(slideNumber: number): Promise<PowerpointDetails> {
		//open Powerpoint File
		await ZipHandler.loadZip(this.PowerpointFilePath);
		let slideShowGlobals = await ZipHandler.parseSlideAttributes("ppt/presentation.xml");
		let slideShowTheme = await ZipHandler.parseSlideAttributes("ppt/theme/theme1.xml");
		let pptElementParser = new PowerpointElementParser(slideShowGlobals, slideShowTheme);

		//only get slideAttributes for one slide and return as array
		let parsedSlideElements = await this.getSlideElements(pptElementParser, slideNumber);

		let pptDetails: PowerpointDetails = {
			slideShowGlobals,
			slideShowTheme,
			powerPointElements: parsedSlideElements,
			inputPath: this.PowerpointFilePath
		};

		return pptDetails;

		//TO-DO: Add option to parse All Slides by Default
		//TO-DO: Return the total # as part of a meta property
	}

	private async getSlideElements(PPTElementParser: PowerpointElementParser, slideNumber) {
		//Get all of Slide Shapes and Elements
		let slideAttributes = await ZipHandler.parseSlideAttributes(format("ppt/slides/slide{0}.xml", slideNumber));
		//Contains references to links,images and etc on a Slide
		let slideRelations = await ZipHandler.parseSlideAttributes(format("ppt/slides/_rels/slide{0}.xml.rels", slideNumber));

		//PROBLEM: Layering Order not Preserved, Shapes Render First, Need to fix
		let slideShapes = slideAttributes["p:sld"]["p:cSld"][0]["p:spTree"][0]["p:sp"] || [];
		let slideImages = slideAttributes["p:sld"]["p:cSld"][0]["p:spTree"][0]["p:pic"] || [];

		let allSlideElements = slideShapes.concat(slideImages);
		let allParsedSlideElements = [];
		for (let slideElement of allSlideElements) {
			let pptElement = PPTElementParser.getProcessedElement(slideElement, slideRelations);

			//throwout any undrenderable content
			if (pptElement) {
				allParsedSlideElements.push(pptElement);
			}
		}

		return allParsedSlideElements;
	}
}
