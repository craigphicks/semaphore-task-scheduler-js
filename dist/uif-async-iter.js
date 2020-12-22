"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AsyncIter = void 0;
const lib_1 = require("./lib");
const uif_common_1 = require("./uif-common");
class AsyncIter extends uif_common_1.Common {
    constructor(...args) {
        super(...args);
        this._q = [];
        this._qe = [];
        this._nextpr = lib_1.makePromolve();
        this._emptyFlag = false;
        this._ts.onTaskResolved(((retval) => {
            this._q.push(retval);
            this._nextpr.resolve();
        }).bind(this));
        this._ts.onTaskRejected(((e) => {
            this._qe.push(e);
            this._nextpr.resolve();
        }).bind(this));
        this._ts.onEmpty((() => {
            this._emptyFlag = true;
            this._nextpr.resolve();
        }).bind(this));
        this._asyncIterable = this._createAsyncIterable();
    }
    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    _createAsyncIterable() {
        // eslint-disable-next-line @typescript-eslint/no-this-alias
        const that = this;
        return {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            next() {
                return __awaiter(this, void 0, void 0, function* () {
                    for (let iter = 0;; iter++) {
                        if (that._qe.length)
                            // errors have priority
                            throw that._qe.splice(0, 1)[0];
                        if (that._q.length)
                            // "normal" return
                            return { done: false, value: that._q.splice(0, 1) };
                        // empty flag may be set before q,qe are drained so check this last
                        // "empty" only means the sts member is empty, not ourself.
                        if (that._emptyFlag)
                            return { done: true };
                        if (iter > 0)
                            throw new Error(`asyncIterator.next, unexpected error iter==${iter}`);
                        // wait here on promise (only once) until new data is ready
                        yield that._nextpr.promise;
                        that._nextpr = lib_1.makePromolve();
                    }
                });
            },
        };
    }
    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    [Symbol.asyncIterator]() {
        return this._asyncIterable;
    }
    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    next() {
        return this._asyncIterable.next();
    }
    // informationals
    getCountResolvedNotRead() {
        return this._q.length;
    }
    getCountRejectedNotRead() {
        return this._qe.length;
    }
    getCountFinishedNotRead() {
        return this._q.length + this._qe.length;
    }
}
exports.AsyncIter = AsyncIter;
//# sourceMappingURL=uif-async-iter.js.map