export{}
interface DestructureArg {num:number}
interface ASig {
  new (carg?:number|DestructureArg):never
}
interface ASig2 {
  new (carg?:number|DestructureArg):any
  new (...args:any[]):any
}
declare type ACtorParams=ConstructorParameters<ASig>


class A {
  num:number
//  constructor(carg?:number|DestructureArg)
//  constructor(...args:any[]){
  constructor(...args:ACtorParams){
  if (args.length==0)
      this.num=0;
    else if (typeof args[0]=="number")
      this.num=args[0]
    else if (args[0] && typeof args[0].num=="number")
      this.num=args[0].num
    else throw new Error('illegal constructor argument');
  }
}
// Good!  Compiler won't allow this -
// Argument of type 'string' is not assignable to parameter 
// of type 'number | DestructureArg'.
// var a=new A("hi"); // compile error :)

class B1 extends A{
  // No error if copy-paste the signature, but abstraction is lost 
  constructor(carg:number|DestructureArg=0){
    super(carg)
  }
}
class B2 extends A {
  // No error if no guard, but then run time error possible
  constructor(...args:any[]){
    super(...args)
  }
}
var b2=new B2("hi"); // runtime error :( "illegal constructor argument"

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
class F extends A{
  str:string
  constructor(str:string,...args:ACtorParams){
    super(...args)
    this.str=str;
  }
}
var f=new F('hi');
//var f=new F('hi');


namespace Xsig{
  type Ctor1 = new (carg?:number) => never
//  type Ctor2 = new (...cargs:string[]) => never
  type Ctor3 = new ({a,b}:{a?:bigint,b?:string}) => never
  export type XCtorParams=
    ConstructorParameters<Ctor1>
//    |ConstructorParameters<Ctor2>
    |ConstructorParameters<Ctor3>
}

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

class X {
  constructor(...args:Xsig.XCtorParams){
    args;
  }
}
class Y extends X {
  constructor(...args:Xsig.XCtorParams){
    super(...args) 
  }
}
var x=new X({b:"hi"}) // compiles :)
var y=new Y({b:"hi"}) // compiles :)

//var x=new X({a:"hi"}) // compile fails :)
//var y=new Y({a:"hi"}) // compile fails :)

// interface Xsig {
//   new (carg:number)
//   new (...cargs:string[])  
// }
