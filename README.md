# Project Overview

Wouldn't it be great if we could use a slideshow canvas as WSIWYG editor rapidly design and ship UIs?

The airppt project was designed to utilize the design elements of powerpoint presentations and make them usable in different applications.

This project was built from the ground up with the consumer in mind. It is built with modularity, extensibility and flexibility in mind. It's **not** a direct PPT -> HTML converter.

I'd love you for you to contribute. Please read the guidelines. I'm also happy to walk you through making your first PR. Set a time that works for you here.

# airppt-parser

Powerpoint stores information in a series of complex XML mappings. Checkout the [OpenXML Spec](https://www.ecma-international.org/news/TC45_current_work/OpenXML%20White%20Paper.pdf) to get an idea of how [complex](http://officeopenxml.com/anatomyofOOXML-pptx.php) it really is.

The parser reads a Powerpoint file, takes in a slide number, and parses it to a standardized JSON object. The JSON object returned is defined as a `PowerPointElement`.

After utilizing the parser, we can pass it on to the [renderer module](https://github.com/airpptx/airppt-renderer#readme) to generate clean HTML/CSS, or you could use the object as you wish in your own application.

## Usage

I highly recommend looking at the [tests](https://github.com/airpptx/airppt-parser/tree/master/tests) folder. I continually keep that up-to-date. Be sure to get the latest package from [NPM](https://www.npmjs.com/package/airppt-parser).

```javascript
let { AirParser } = require("airppt-parser");

let pptParser = new AirParser("./sample.pptx");
waitForParsing();

async function waitForParsing() {
	//pass in the slide number and wait
	let result = await pptParser.ParsePowerPoint(1);

	//returns an array of Powerpoint Elements and some extra MetaData
	console.log(result);
}
```

## Powerpoint Element

Here is the interface definition of a `PowerpointElement`:

```javascript
export interface PowerpointElement {
	name: string;
	shapeType: ElementType;
	specialityType: SpecialityType;
	elementPosition: {
		x: number,
		y: number
	};
	elementOffsetPosition: {
		cx: number,
		cy: number
	};
	paragraph?: {
		text: string,
		textCharacterProperties: {
			fontAttributes: FontAttributes[],
			font: string,
			size: number,
			fillColor: string
		},
		paragraphProperties: {
			alignment: TextAlignment
		}
	};
	shape?: {
		border?: {
			thickness: number,
			color: string,
			type: BorderType,
			radius?: number
		},
		fill: {
			fillType: FillType,
			fillColor: string
		},
		opacity: number
	};
	fontStyle?: {
		font: string,
		fontSize: number,
		fontColor: string
	};
	links?: {
		Type: LinkType,
		Uri: string
	};
	raw: any;
}
```

There's are also a number of enums as well. See the entire [interface](https://github.com/airpptx/airppt-models/blob/master/pptelement.d.ts) here.
