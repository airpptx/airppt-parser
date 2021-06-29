"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cleanupJson = void 0;
const cleanupJson = (element) => {
    for (const [key, value] of Object.entries(element)) {
        if (!value) {
            delete element[key];
        }
    }
    return element;
};
exports.cleanupJson = cleanupJson;
