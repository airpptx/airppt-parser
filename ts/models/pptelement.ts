/**
 * The model for a parsed Powerpoint Element which the parsers generate
 */
export interface PowerpointElement {
	name: string; //or the name combined
	shapeType: ElementType; //
	specialityType: SpecialityType; ///Flag to do something special such as "images","textboxes","media"
	elementPosition: {
		//location to place the element
		x: number;
		y: number;
	};
	elementOffsetPosition: {
		cx: number;
		cy: number;
	};
	paragraph?: {
		text: string;
		textCharacterProperties: {
			fontAttributes: FontAttributes[];
			font: string;
			size: number;
			fillColor: string;
		};
		paragraphProperties: {
			alignment: TextAlignment;
		};
	};
	shape?: {
		border?: {
			thickness: number;
			color: string;
			type: BorderType;
			radius?: number;
		};
		fill: {
			fillType: FillType;
			fillColor: string;
		};
		opacity: number;
	};
	fontStyle?: {
		font: string;
		fontSize: number;
		fontColor: string;
	};
	links?: {
		Type: LinkType;
		Uri: string;
		//wherever or whichever element this might link do
	};
	raw: any; //the entire unparsed element object
}

export enum ElementType {
	Ellipse = "Ellipse",
	RoundedRectangle = "RoundedRectangle",
	Rectangle = "Rectangle",
	Octagon = "Octagon",
	Frame = "Frame",
	Triangle = "Triangle",
	RightTriangle = "RightTriangle",
	Image = "Image",
	Textbox = "Textbox",
	Media = "Media"
}

export enum SpecialityType {
	Textbox = "Textbox",
	Image = "Image",
	None = "None"
}

export enum BorderType {
	dotted = "dotted",
	dashed = "dashed",
	solid = "solid"
}

export enum FontAttributes {
	Bold,
	Italics,
	Underline,
	StrikeThrough
}

export enum TextAlignment {
	Center = "center",
	Left = "left",
	Right = "right",
	Justified = "justify"
}

export enum LinkType {
	Asset = "Asset",
	External = "External"
}

export enum FillType {
	Image = "Image",
	Solid = "Solid"
}
