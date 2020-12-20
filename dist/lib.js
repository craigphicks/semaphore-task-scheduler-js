"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.makePromolve = void 0;
function makePromolve() {
    // @ts-expect-error
    let pr = {};
    pr.promise = new Promise(r => pr.resolve = r);
    return pr;
}
exports.makePromolve = makePromolve;
//# sourceMappingURL=lib.js.map