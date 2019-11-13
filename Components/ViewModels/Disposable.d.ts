declare module DW {
    export function dispose(obj: any): void;
    export interface IDisposable {
        dispose();
    }
    export class Disposable implements IDisposable {
        dispose();
        addDisposableTask<T>(task: JQueryPromise<T>): JQueryPromise<T>;
        /*
         * removes element from the list with disposables and returns it
         */
        removeDisposable<T>(disposable: T): T;
        addDisposable<T>(disposable: T): T;

    }
} 