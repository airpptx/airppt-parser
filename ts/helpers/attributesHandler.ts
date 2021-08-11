export const getAttributeByPath = (slideAttributes, pathArray: string[], returnValue = undefined) => {
    if (pathArray.length === 0) {
        return returnValue;
    }

    if (slideAttributes === undefined) {
        return returnValue;
    }

    for (const node of pathArray) {
        if (Array.isArray(slideAttributes)) {
            //get the first index and that will be an object,
            //so far haven't seen arrays of arrays in OOXML structure
            slideAttributes = slideAttributes[0];
        }
        slideAttributes = slideAttributes[node];
        if (slideAttributes === undefined) {
            return returnValue;
        }
    }

    if (Array.isArray(returnValue)) {
        return Array.isArray(slideAttributes) ? slideAttributes : [];
    }

    return slideAttributes;
};
