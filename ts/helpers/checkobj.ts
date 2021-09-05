/**
 *
 * Important function that allows for undefined objects that maybe nested deeper and missing
 */

import * as get from "lodash.get"
import * as has from "lodash.has"

export function getValueAtPath(obj: any, path: string): any {
    return get(obj, path)
}

export function checkPath(obj: any, path: string): boolean {
    return has(obj, path);
}
