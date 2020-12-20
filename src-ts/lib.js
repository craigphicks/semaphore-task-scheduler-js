"use strict";
exports.__esModule = true;
exports.makePromolve = void 0;
function makePromolve() {
    // @ts-expect-error
    var pr = {};
    pr.promise = new Promise(function (r) { return pr.resolve = r; });
    return pr;
}
exports.makePromolve = makePromolve;
