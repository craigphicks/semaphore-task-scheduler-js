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
var A = /** @class */ (function () {
    function A() {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        if (args.length == 0)
            this.num = 0;
        else if (typeof args[0] == "number")
            this.num = args[0];
        else if (args[0].num)
            this.num = args[0].num;
        else
            throw new Error('illegal constructor argument');
    }
    return A;
}());
var C = /** @class */ (function (_super) {
    __extends(C, _super);
    function C() {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        var _this = _super.apply(this, args) || this;
        _this.c = [0];
        return _this;
    }
    return C;
}(A));
var D = /** @class */ (function (_super) {
    __extends(D, _super);
    function D(carg) {
        return _super.call(this, carg) || this;
    }
    return D;
}(A));
var c0 = new C(0);
//  var c1 = new C('hi');
