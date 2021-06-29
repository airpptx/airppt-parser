"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAttributeByPath = void 0;
const getAttributeByPath = (slideAttributes, pathArray) => {
    if (pathArray.length === 0) {
        //TODO: catch this error
        throw Error("Invalid path");
    }
    if (slideAttributes === undefined) {
        return undefined;
    }
    for (const node of pathArray) {
        slideAttributes = slideAttributes[node] || slideAttributes[0][node];
        if (slideAttributes === undefined) {
            return [];
        }
    }
    return slideAttributes;
};
exports.getAttributeByPath = getAttributeByPath;
