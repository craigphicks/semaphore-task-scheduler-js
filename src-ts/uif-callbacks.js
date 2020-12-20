"use strict";
/* eslint-disable no-unused-vars */
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
exports.__esModule = true;
exports.Callbacks = void 0;
//import type {Promolve,} from './lib'
//import {makePromolve} from './lib'
var uif_common_1 = require("./uif-common");
var Callbacks = /** @class */ (function (_super) {
    __extends(Callbacks, _super);
    function Callbacks() {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        return _super.apply(this, args) || this;
    }
    Callbacks.prototype.onTaskResolved = function (cb) { this._ts.onTaskResolved(cb); };
    Callbacks.prototype.onTaskRejected = function (cb) { this._ts.onTaskRejected(cb); };
    Callbacks.prototype.onEmpty = function (cb) { this._ts.onEmpty(cb); };
    return Callbacks;
}(uif_common_1.Common));
exports.Callbacks = Callbacks;
