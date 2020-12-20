"use strict";
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
exports.NextSymbol = void 0;
var lib_1 = require("./lib");
var uif_common_1 = require("./uif-common");
//const {TaskSerializer}=require('./task-serializer.js');
var NextSymbol = /** @class */ (function (_super) {
    __extends(NextSymbol, _super);
    function NextSymbol() {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        var _this = _super.apply(this, args) || this;
        _this._result = lib_1.makePromolve();
        _this._error = lib_1.makePromolve();
        _this._qresults = [];
        _this._qerrors = [];
        _this._empty = lib_1.makePromolve();
        _this._ts.onTaskResolved(function (result) {
            _this._qresults.push(result);
            _this._result.resolve();
        });
        _this._ts.onTaskRejected(function (error) {
            _this._qerrors.push(error);
            _this._error.resolve();
        });
        _this._ts.onEmpty(function () {
            _this._empty.resolve();
        });
        _this._symTaskResolved = Symbol('TaskResolved');
        _this._symTaskRejected = Symbol('TaskRejected');
        _this._symAllRead = Symbol('AllRead');
        return _this;
    }
    NextSymbol.prototype.getTaskResolvedValue = function () {
        if (!this._qresults.length)
            throw new Error('getTaskResolvedValue - not ready');
        if (this._qresults.length == 1)
            this._result = lib_1.makePromolve();
        return this._qresults.splice(0, 1)[0];
    };
    NextSymbol.prototype.getTaskRejectedValue = function () {
        if (!this._qerrors.length)
            throw new Error('getTaskRejectedValue - not ready');
        if (this._qerrors.length == 1)
            this._error = lib_1.makePromolve();
        return this._qerrors.splice(0, 1)[0];
    };
    NextSymbol.prototype.symbolAllRead = function () { return this._symAllRead; };
    NextSymbol.prototype.symbolTaskResolved = function () { return this._symTaskResolved; };
    NextSymbol.prototype.symbolTaskRejected = function () { return this._symTaskRejected; };
    NextSymbol.prototype.nextSymbol = function () {
        var _this = this;
        // Note: the order of promises ensures that this._symAllRead
        // won't be returned until all task results are actually read.
        return Promise.race([
            this._error.promise.then(function () { return _this._symTaskRejected; }),
            this._result.promise.then(function () { return _this._symTaskResolved; }),
            this._empty.promise.then(function () { return _this._symAllRead; }),
        ]);
    };
    // informationals
    NextSymbol.prototype.getCountResolvedNotRead = function () { return this._qresults.length; };
    NextSymbol.prototype.getCountRejectedNotRead = function () { return this._qerrors.length; };
    NextSymbol.prototype.getCountFinishedNotRead = function () {
        return this._qresults.length + this._qerrors.length;
    };
    return NextSymbol;
}(uif_common_1.Common));
exports.NextSymbol = NextSymbol;
//module.exports.NextSymbol=NextSymbol;
