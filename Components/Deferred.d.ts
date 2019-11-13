declare namespace DW {
    export function Deferred<T>(beforeStart?: (deferred: JQueryDeferred<T>) => any): JQueryDeferred<T>;
    export function When<T>(...deferreds: Array<T | JQueryPromise<T>/* as JQueryDeferred<T> */>): JQueryPromise<T>;
}