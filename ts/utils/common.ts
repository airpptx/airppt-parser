export const cleanupJson = (element) => {
    for (const [key, value] of Object.entries(element)) {
        if (!value) {
            delete element[key];
        }
    }

    return element;
};
