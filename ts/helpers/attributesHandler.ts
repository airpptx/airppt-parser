export const getAttributeByPath = (slideAttributes, pathArray: string[], returnValue = undefined) => {
    if (pathArray.length === 0) {
        return returnValue;
    }

    if (slideAttributes === undefined) {
        return returnValue;
    }

    for (const node of pathArray) {
        if (Array.isArray(slideAttributes)) {
            slideAttributes = slideAttributes[node] || slideAttributes[0][node];
        } else {
            slideAttributes = slideAttributes[node];
        }
        if (slideAttributes === undefined) {
            return returnValue;
        }
    }

    if (Array.isArray(returnValue)) {
        return Array.isArray(slideAttributes) ? slideAttributes : [];
    }

    return slideAttributes;
};
