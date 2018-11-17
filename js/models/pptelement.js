"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ElementType;
(function (ElementType) {
    ElementType["Ellipse"] = "Ellipse";
    ElementType["RoundedRectangle"] = "RoundedRectangle";
    ElementType["Rectangle"] = "Rectangle";
    ElementType["Octagon"] = "Octagon";
    ElementType["Frame"] = "Frame";
    ElementType["Triangle"] = "Triangle";
    ElementType["RightTriangle"] = "RightTriangle";
    ElementType["Image"] = "Image";
    ElementType["Textbox"] = "Textbox";
    ElementType["Media"] = "Media";
})(ElementType = exports.ElementType || (exports.ElementType = {}));
var SpecialityType;
(function (SpecialityType) {
    SpecialityType["Textbox"] = "Textbox";
    SpecialityType["Image"] = "Image";
    SpecialityType["None"] = "None";
})(SpecialityType = exports.SpecialityType || (exports.SpecialityType = {}));
var BorderType;
(function (BorderType) {
    BorderType["dotted"] = "dotted";
    BorderType["dashed"] = "dashed";
    BorderType["solid"] = "solid";
})(BorderType = exports.BorderType || (exports.BorderType = {}));
var FontAttributes;
(function (FontAttributes) {
    FontAttributes[FontAttributes["Bold"] = 0] = "Bold";
    FontAttributes[FontAttributes["Italics"] = 1] = "Italics";
    FontAttributes[FontAttributes["Underline"] = 2] = "Underline";
    FontAttributes[FontAttributes["StrikeThrough"] = 3] = "StrikeThrough";
})(FontAttributes = exports.FontAttributes || (exports.FontAttributes = {}));
var TextAlignment;
(function (TextAlignment) {
    TextAlignment["Center"] = "center";
    TextAlignment["Left"] = "left";
    TextAlignment["Right"] = "right";
    TextAlignment["Justified"] = "justify";
})(TextAlignment = exports.TextAlignment || (exports.TextAlignment = {}));
var LinkType;
(function (LinkType) {
    LinkType["Asset"] = "Asset";
    LinkType["External"] = "External";
})(LinkType = exports.LinkType || (exports.LinkType = {}));
var FillType;
(function (FillType) {
    FillType["Image"] = "Image";
    FillType["Solid"] = "Solid";
})(FillType = exports.FillType || (exports.FillType = {}));
