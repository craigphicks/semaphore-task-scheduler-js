"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.makePromolve = void 0;
function makePromolve() {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const pr = {};
    pr.promise = new Promise((r) => (pr.resolve = r));
    return pr;
}
exports.makePromolve = makePromolve;
//# sourceMappingURL=lib.js.map