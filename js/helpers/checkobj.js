"use strict";
/**
 *
 * Important function that allows for undefined objects that maybe nested deeper and missing
 */
Object.defineProperty(exports, "__esModule", { value: true });
const format = require("string-template");
function CheckValidObject(obj, path) {
    try {
        return eval(format("obj{0}", path));
    }
    catch (e) {
        return undefined;
    }
}
exports.CheckValidObject = CheckValidObject;
