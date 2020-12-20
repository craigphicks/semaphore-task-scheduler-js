"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NextSymbol = void 0;
const lib_1 = require("./lib");
const uif_common_1 = require("./uif-common");
//const {TaskSerializer}=require('./task-serializer.js');
class NextSymbol extends uif_common_1.Common {
    constructor(...args) {
        super(...args);
        this._result = lib_1.makePromolve();
        this._error = lib_1.makePromolve();
        this._qresults = [];
        this._qerrors = [];
        this._empty = lib_1.makePromolve();
        this._ts.onTaskResolved((result) => {
            this._qresults.push(result);
            this._result.resolve();
        });
        this._ts.onTaskRejected((error) => {
            this._qerrors.push(error);
            this._error.resolve();
        });
        this._ts.onEmpty(() => {
            this._empty.resolve();
        });
        this._symTaskResolved = Symbol('TaskResolved');
        this._symTaskRejected = Symbol('TaskRejected');
        this._symAllRead = Symbol('AllRead');
    }
    getTaskResolvedValue() {
        if (!this._qresults.length)
            throw new Error('getTaskResolvedValue - not ready');
        if (this._qresults.length == 1)
            this._result = lib_1.makePromolve();
        return this._qresults.splice(0, 1)[0];
    }
    getTaskRejectedValue() {
        if (!this._qerrors.length)
            throw new Error('getTaskRejectedValue - not ready');
        if (this._qerrors.length == 1)
            this._error = lib_1.makePromolve();
        return this._qerrors.splice(0, 1)[0];
    }
    symbolAllRead() { return this._symAllRead; }
    symbolTaskResolved() { return this._symTaskResolved; }
    symbolTaskRejected() { return this._symTaskRejected; }
    nextSymbol() {
        // Note: the order of promises ensures that this._symAllRead
        // won't be returned until all task results are actually read.
        return Promise.race([
            this._error.promise.then(() => { return this._symTaskRejected; }),
            this._result.promise.then(() => { return this._symTaskResolved; }),
            this._empty.promise.then(() => { return this._symAllRead; }),
        ]);
    }
    // informationals
    getCountResolvedNotRead() { return this._qresults.length; }
    getCountRejectedNotRead() { return this._qerrors.length; }
    getCountFinishedNotRead() {
        return this._qresults.length + this._qerrors.length;
    }
}
exports.NextSymbol = NextSymbol;
//module.exports.NextSymbol=NextSymbol;
//# sourceMappingURL=uif-next-symbol.js.map