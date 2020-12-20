declare type Resolver = (value?: any) => void;
interface Promolve {
    promise: Promise<any>;
    resolve: Resolver;
}
declare function makePromolve(): Promolve;
export type { Resolver, Promolve };
export { makePromolve };
