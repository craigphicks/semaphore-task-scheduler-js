

type Resolver=(value?:any)=>void
interface Promolve{
  promise:Promise<any>
  resolve:Resolver
}

function makePromolve():Promolve{
  // @ts-expect-error
  let pr={};pr.promise=new Promise(r=>pr.resolve=r); return pr;
}

export type {Resolver,Promolve}
export {makePromolve}
