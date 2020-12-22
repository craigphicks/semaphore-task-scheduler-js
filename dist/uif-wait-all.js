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
exports.WaitAll = void 0;
const lib_1 = require("./lib");
const uif_common_1 = require("./uif-common");
class WaitAll extends uif_common_1.Common {
    constructor(...args) {
        super(...args);
        this._results = [];
        this._error = lib_1.makePromolve();
        this._empty = lib_1.makePromolve();
        this._ts.onTaskResolved((result) => {
            this._results.push(Promise.resolve(result));
        });
        this._ts.onTaskRejected((err) => {
            // defuse the error so it doesn't become unhandled rejection
            // eslint-disable-next-line no-unused-vars
            const p = Promise.reject(err);
            p.catch((e) => e); //defuse
            this._results.push(p);
            this._error.resolve();
        });
        this._ts.onEmpty(() => {
            this._empty.resolve();
        });
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    waitAll() {
        return __awaiter(this, void 0, void 0, function* () {
            yield Promise.race([this._error.promise, this._empty.promise]);
            return yield Promise.all(this._results);
        });
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    waitAllSettled() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this._empty.promise;
            return yield Promise.allSettled(this._results);
        });
    }
}
exports.WaitAll = WaitAll;
//# sourceMappingURL=uif-wait-all.js.map