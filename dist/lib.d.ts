interface Promolve<T = void> {
    promise: Promise<T>;
    resolve: (value: T) => void;
}
declare function makePromolve<T = void>(): Promolve<T>;
export type { Promolve };
export { makePromolve };
