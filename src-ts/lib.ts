//type Resolver=(value?:never)=>void
interface Promolve<T = void> {
  promise: Promise<T>;
  resolve: (value: T) => void;
}

function makePromolve<T = void>(): Promolve<T> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const pr: any = {};
  pr.promise = new Promise((r) => (pr.resolve = r));
  return pr as Promolve<T>;
}

export type {Promolve};
export {makePromolve};
