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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
exports.AsyncIter = void 0;
var lib_1 = require("./lib");
var uif_common_1 = require("./uif-common");
var AsyncIter = /** @class */ (function (_super) {
    __extends(AsyncIter, _super);
    function AsyncIter() {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        var _this = _super.apply(this, args) || this;
        _this._q = [];
        _this._qe = [];
        _this._nextpr = lib_1.makePromolve();
        _this._emptyFlag = false;
        _this._ts.onTaskResolved((function (retval) {
            _this._q.push(retval);
            _this._nextpr.resolve();
        }).bind(_this));
        _this._ts.onTaskRejected((function (e) {
            _this._qe.push(e);
            _this._nextpr.resolve();
        }).bind(_this));
        _this._ts.onEmpty((function () {
            _this._emptyFlag = true;
            _this._nextpr.resolve();
        }).bind(_this));
        _this._asyncIterable = _this._createAsyncIterable();
        return _this;
    }
    AsyncIter.prototype._reset_nextpr = function () {
        this._nextpr = lib_1.makePromolve();
    };
    AsyncIter.prototype._createAsyncIterable = function () {
        var that = this;
        return {
            next: function () {
                return __awaiter(this, void 0, void 0, function () {
                    var iter;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                iter = 0;
                                _a.label = 1;
                            case 1:
                                if (that._qe.length) // errors have priority
                                    throw that._qe.splice(0, 1)[0];
                                if (that._q.length) // "normal" return
                                    return [2 /*return*/, { done: false, value: that._q.splice(0, 1) }];
                                // empty flag may be set before q,qe are drained so check this last
                                // "empty" only means the sts member is empty, not ourself.
                                if (that._emptyFlag)
                                    return [2 /*return*/, { done: true }];
                                if (iter > 0)
                                    throw new Error("asyncIterator.next, unexpected error iter==" + iter);
                                // wait here on promise (only once) until new data is ready
                                return [4 /*yield*/, that._nextpr.promise];
                            case 2:
                                // wait here on promise (only once) until new data is ready
                                _a.sent();
                                that._nextpr = lib_1.makePromolve();
                                _a.label = 3;
                            case 3:
                                iter++;
                                return [3 /*break*/, 1];
                            case 4: return [2 /*return*/];
                        }
                    });
                });
            }
        };
    };
    AsyncIter.prototype[Symbol.asyncIterator] = function () { return this._asyncIterable; };
    AsyncIter.prototype.next = function () { return this._asyncIterable.next(); };
    // informationals
    // getCountWaiting(){return this._ts.getWaitingCount();}
    // getCountWorking(){return this._ts.getWorkingCount();}
    AsyncIter.prototype.getCountResolvedNotRead = function () { return this._q.length; };
    AsyncIter.prototype.getCountRejectedNotRead = function () { return this._qe.length; };
    AsyncIter.prototype.getCountFinishedNotRead = function () { return this._q.length + this._qe.length; };
    return AsyncIter;
}(uif_common_1.Common));
exports.AsyncIter = AsyncIter;
