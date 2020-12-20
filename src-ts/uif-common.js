"use strict";
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
exports.__esModule = true;
exports.Common = void 0;
//import {Promolve} from './lib'
var task_serializer_1 = require("./task-serializer");
// interface CtorArg {concurrentTaskLimit:number} 
// interface CommonCtor{
//   new (carg?:number):any
//   new (carg:CtorArg):any
// }
var Common = /** @class */ (function () {
    function Common() {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        var concurrentTaskLimit = 0;
        if (args.length) {
            if (typeof args[0] == 'number')
                concurrentTaskLimit = args[0];
            else if (typeof args[0] == "object" &&
                typeof args[0].concurrentTaskLimit == "number")
                concurrentTaskLimit = args[0].concurrentTaskLimit;
            else
                throw new Error('illegal constructor parameter(s)');
        }
        this._ts = new task_serializer_1.TaskSerializer(concurrentTaskLimit);
    }
    Common.prototype.addTask = function () {
        var _a;
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        (_a = this._ts).addTask.apply(_a, __spreadArrays([args[0]], args.slice(1)));
    };
    Common.prototype.addEnd = function () {
        this._ts.addEnd();
    };
    Common.prototype.getCountWaiting = function () { return this._ts.getWaitingCount(); };
    Common.prototype.getCountWorking = function () { return this._ts.getWorkingCount(); };
    Common.prototype.getCountResolvedTotal = function () { return this._ts.getResolvedCount(); };
    Common.prototype.getCountRejectedTotal = function () { return this._ts.getRejectedCount(); };
    Common.prototype.getCountFinishedTotal = function () { return this._ts.getFinishedCount(); };
    return Common;
}());
exports.Common = Common;
