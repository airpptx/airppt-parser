"use strict";
var expect = require("chai").expect;
let { AirParser } = require("../js/main.js");

//TO-DO: Write test for each shape and slide number and confirm
let pptParser = new AirParser("./sample.pptx", 5);

waitForParsing();

async function waitForParsing() {
	let result = await pptParser.ParsePowerPoint();
	console.log(result);
}
