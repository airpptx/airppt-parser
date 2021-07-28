export const getAttributeByPath = (slideAttributes, pathArray: string[]) => {
    if (pathArray.length === 0) {
        //TODO: catch this error
        throw Error("Invalid path");
    }

    if (slideAttributes === undefined) {
        return undefined;
    }

    for (const node of pathArray) {
        if (Array.isArray(slideAttributes)) {
            slideAttributes = slideAttributes[node] || slideAttributes[0][node];
        } else {
            slideAttributes = slideAttributes[node];
        }
        if (slideAttributes === undefined) {
            return [];
        }
    }

    return slideAttributes;
};
