
interface DestructureArg {num:number}

namespace Ans {
    export type Constructor = new (carg?:number|DestructureArg) =>never
}

class A {
  num:number
  constructor(carg?:ConstructorParameters<Ans.Constructor>[0])

  constructor(...args:any[]){
    if (args.length==0)
      this.num=0;
    else if (typeof args[0]=="number")
      this.num=args[0]
    else if (args[0].num)
      this.num=args[0].num
    else throw new Error('illegal constructor argument');
  }
}

class C extends A{
    c:number[]
    constructor(...args:ConstructorParameters<Ans.Constructor>){
      super(...args)
      this.c=[0];
    }
  }
  class D extends A{
    constructor(carg: ConstructorParameters<Ans.Constructor>[0]){
      super(carg)
    }
  }

  var c0 = new C(0);
//  var c1 = new C('hi');
