'use strict';
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
exports.TaskSerializer = void 0;
var lib_1 = require("./lib");
// type EmptyCallback=()=>void
// type TaskCallback=(value:any)=>void
// type Resolver=(value?:any)=>void
// interface Promolve{
//   promise:Promise<any>
//   resolve:Resolver
// }
var Semaphore = /** @class */ (function () {
    function Semaphore(concurrentLimit) {
        if (concurrentLimit === void 0) { concurrentLimit = 0; }
        this._concurrentLimit = concurrentLimit;
        this._count = concurrentLimit;
        this._resolveq = [];
    }
    Semaphore.prototype.wait = function () {
        return __awaiter(this, void 0, void 0, function () {
            var res, p;
            return __generator(this, function (_a) {
                if (this._count > 0) {
                    this._count--;
                    return [2 /*return*/];
                }
                p = new Promise(function (r) { res = r; });
                // @ts-expect-error : Variable 'res' is used before being assigned.
                this._resolveq.push(res);
                return [2 /*return*/, p];
            });
        });
    };
    Semaphore.prototype.signal = function () {
        if (this._resolveq.length)
            (this._resolveq.splice(0, 1)[0])(); // resolve it 
        else
            this._count++;
    };
    Semaphore.prototype.getCount = function () { return this._count; };
    Semaphore.prototype.getconcurrentLimit = function () { return this._concurrentLimit; };
    Semaphore.prototype.getWaitingCount = function () { return this._resolveq.length; };
    return Semaphore;
}());
var TaskSerializer = /** @class */ (function () {
    function TaskSerializer(concurrentLimit) {
        this._usingConcurrentLimit = (concurrentLimit > 0);
        this._sem = null;
        if (this._usingConcurrentLimit)
            this._sem = new Semaphore(concurrentLimit);
        this._numAdded = 0;
        //this._numFinished=0;
        // each finished with be either resolved or rejected
        this._numResolved = 0;
        this._numRejected = 0;
        this._onEmptyCallback = null;
        this._onTaskResolvedCallback = null;
        this._onTaskRejectedCallback = null;
        this._endFlag = false;
    }
    TaskSerializer._makepr = function () {
        return lib_1.makePromolve();
    };
    TaskSerializer.prototype.addTask = function () {
        var _this = this;
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        var func = args.shift();
        var p = (function () { return __awaiter(_this, void 0, void 0, function () {
            var result, e_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this._usingConcurrentLimit) return [3 /*break*/, 2];
                        // @ts-expect-error: Object is possibly 'null'.
                        return [4 /*yield*/, this._sem.wait()];
                    case 1:
                        // @ts-expect-error: Object is possibly 'null'.
                        _a.sent();
                        _a.label = 2;
                    case 2:
                        _a.trys.push([2, 6, 7, 8]);
                        result = void 0;
                        if (!(func instanceof Function)) return [3 /*break*/, 4];
                        return [4 /*yield*/, func.apply(void 0, args)];
                    case 3:
                        result = _a.sent();
                        return [3 /*break*/, 5];
                    case 4:
                        if (func instanceof Promise) {
                            if (this._usingConcurrentLimit)
                                throw new Error('addTask, illogical to add promise when concurrent limit in use');
                            result = func; // OK
                        }
                        else
                            throw new Error('addTask first arg must be instance of Function or Promise');
                        _a.label = 5;
                    case 5:
                        this._numResolved++;
                        if (this._onTaskResolvedCallback)
                            this._onTaskResolvedCallback(result);
                        return [2 /*return*/, result];
                    case 6:
                        e_1 = _a.sent();
                        this._numRejected++;
                        if (this._onTaskRejectedCallback)
                            this._onTaskRejectedCallback(e_1);
                        throw e_1;
                    case 7:
                        if (this._usingConcurrentLimit)
                            // @ts-expect-error: Object is possibly 'null'.
                            this._sem.signal();
                        if (this._endFlag
                            && this.getWaitingCount() == 0 && this.getWorkingCount() == 0) {
                            if (this._onEmptyCallback)
                                this._onEmptyCallback();
                        }
                        return [7 /*endfinally*/];
                    case 8: return [2 /*return*/];
                }
            });
        }); })();
        this._numAdded++;
        // eslint-disable-next-line no-unused-vars
        p["catch"](function (e) { }); // unhandledRejection-defuse, without this, boom!
        // if (this._taskq) 
        //   this._taskq.push(p);// defused  
        //return p;
    };
    TaskSerializer.prototype.addEnd = function () {
        this._endFlag = true;
        // this section required in case addEnd() is called after all 
        // tasks have already finished, c.f. addTask() similar code.
        if (this.getWaitingCount() == 0 && this.getWorkingCount() == 0) {
            if (this._onEmptyCallback)
                this._onEmptyCallback();
        }
    };
    TaskSerializer.prototype.getWorkingCount = function () {
        return this._numAdded - this.getFinishedCount() - this.getWaitingCount();
    };
    TaskSerializer.prototype.getWaitingCount = function () {
        // @ts-expect-error: Object is possibly 'null'.
        return this._usingConcurrentLimit ? this._sem.getWaitingCount() : 0;
    };
    TaskSerializer.prototype.getFinishedCount = function () {
        return this.getResolvedCount() + this.getRejectedCount();
    };
    TaskSerializer.prototype.getResolvedCount = function () { return this._numResolved; };
    TaskSerializer.prototype.getRejectedCount = function () { return this._numRejected; };
    TaskSerializer.prototype.onEmpty = function (callback) { this._onEmptyCallback = callback; };
    TaskSerializer.prototype.onTaskResolved = function (callback) { this._onTaskResolvedCallback = callback; };
    TaskSerializer.prototype.onTaskRejected = function (callback) { this._onTaskRejectedCallback = callback; };
    return TaskSerializer;
}());
exports.TaskSerializer = TaskSerializer;
