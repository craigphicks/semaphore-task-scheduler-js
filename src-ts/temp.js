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
var A = /** @class */ (function () {
    //  constructor(carg?:number|DestructureArg)
    //  constructor(...args:any[]){
    function A() {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        if (args.length == 0)
            this.num = 0;
        else if (typeof args[0] == "number")
            this.num = args[0];
        else if (args[0] && typeof args[0].num == "number")
            this.num = args[0].num;
        else
            throw new Error('illegal constructor argument');
    }
    return A;
}());
// Good!  Compiler won't allow this -
// Argument of type 'string' is not assignable to parameter 
// of type 'number | DestructureArg'.
// var a=new A("hi"); // compile error :)
var B1 = /** @class */ (function (_super) {
    __extends(B1, _super);
    // No error if copy-paste the signature, but abstraction is lost 
    function B1(carg) {
        if (carg === void 0) { carg = 0; }
        return _super.call(this, carg) || this;
    }
    return B1;
}(A));
var B2 = /** @class */ (function (_super) {
    __extends(B2, _super);
    // No error if no guard, but then run time error possible
    function B2() {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        return _super.apply(this, args) || this;
    }
    return B2;
}(A));
var b2 = new B2("hi"); // runtime error :( "illegal constructor argument"
// B3 fails to compile
// *Class 'B3' incorrectly implements interface 'ASig'.
// *Type 'B3' provides no match for the signature 
//    'new (carg?: number | DestructureArg): any'.
/*
class B3 extends A implements ASig1 {
  constructor(...args:any[]){
    super(...args)
}
*/
// class B4 extends A implements ASig2 {
//   constructor(...args:any[]){
//     super(...args)
//   }
// }
// C fails to compile
/*
class C extends A{
  //Type 'A' does not satisfy the constraint 'new (...args: any) => any'.
  //Type 'A' provides no match for the signature 'new (...args: any): any'.
  constructor(...args:ConstructorParameters<A>){
    // Type 'never' must have a '[Symbol.iterator]()' method that returns an iterator.
    super(...args)
  }
}
*/
// D fails to compile
/*
class D extends A{
  //Type 'A' does not satisfy the constraint 'new (...args: any) => any'.
  constructor(carg:ConstructorParameters<A>){
    super(carg)
  }
}
*/
var F = /** @class */ (function (_super) {
    __extends(F, _super);
    function F(str) {
        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
        }
        var _this = _super.apply(this, args) || this;
        _this.str = str;
        return _this;
    }
    return F;
}(A));
var f = new F('hi');
// interface xsig{
//   new (carg?:number):any
//   new (...cargs:string[]):any
//   new ({a,b}:{a?:bigint,b?:string}):any
// }
// declare type xsigParams=ConstructorParameters<xsig>
// class XXX{
//   constructor(...args:xsigParams){
//   } 
// }
// *Type '0' has no properties in common with 
// *type '{ a?: bigint; b?: string; }'. 
//var xxx=new XXX(0);
var X = /** @class */ (function () {
    function X() {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        args;
    }
    return X;
}());
var Y = /** @class */ (function (_super) {
    __extends(Y, _super);
    function Y() {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        return _super.apply(this, args) || this;
    }
    return Y;
}(X));
var x = new X({ b: "hi" }); // compiles :)
var y = new Y({ b: "hi" }); // compiles :)
//var x=new X({a:"hi"}) // compile fails :)
//var y=new Y({a:"hi"}) // compile fails :)
// interface Xsig {
//   new (carg:number)
//   new (...cargs:string[])  
// }
