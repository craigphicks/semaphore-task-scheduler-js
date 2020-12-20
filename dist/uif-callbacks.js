"use strict";
/* eslint-disable no-unused-vars */
Object.defineProperty(exports, "__esModule", { value: true });
exports.Callbacks = void 0;
//import type {Promolve,} from './lib'
//import {makePromolve} from './lib'
const uif_common_1 = require("./uif-common");
class Callbacks extends uif_common_1.Common {
    constructor(...args) {
        super(...args);
    }
    onTaskResolved(cb) { this._ts.onTaskResolved(cb); }
    onTaskRejected(cb) { this._ts.onTaskRejected(cb); }
    onEmpty(cb) { this._ts.onEmpty(cb); }
}
exports.Callbacks = Callbacks;
//# sourceMappingURL=uif-callbacks.js.map