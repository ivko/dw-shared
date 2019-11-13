declare function $R(resource: string, ...params: any[]): string;
declare var extend: any;

declare module DW.Utils {
    /**
    * Are two values equal, deep compare for objects and arrays.
    * @param a {any}
    * @param b {any}
    * @param isCaseSensitive { boolean } - 
    *    determines if the comparation should be case sensitive or not (use only if you expect strings)
    *       - default value - false
    * @return {boolean} Are equal?
    */
    export function isEqual(objToCompare: any, objToCompareWith: any, isCaseSensitive?: boolean): boolean;

    export function isEqualSkippingProperties(objToCompare: any, objToCompareWith: any, propertiesToSkip?: string[], isCaseSensitive?: boolean): boolean;

    export module jstz {
        export function deretmine(): IDetermine;

        interface IDetermine {
            name(): string;
        }
    }
}

interface Object {
    /**
    * Returns an array of the objects' values
    *
    */
    values(obj: Object): any[];
}

interface Window {
    MutationObserver: MutationObserverFactory;
    WebKitMutationObserver: MutationObserverFactory;
    MozMutationObserver: MutationObserverFactory;
}

interface MutationObserverFactory {
    new (callback: (mutations: MutationRecord[]) => void): MutationObserver;
}

interface ILimitedResultObjectResult<T> {
    more: boolean,
    result: Array<T>
}

interface Array<T> {
    /**
    * Limit array content
    * @param limit { number } - limit number
    */
    limitedResultObject<T>(limit: number): ILimitedResultObjectResult<T>;

    /**
    * Limit array content
    * @param sortDir { number } 
    * @param sortBy { string|number } 
    * @param caseInsensitive { boolean } 
    */
    alphanumSort(sortDir: number, sortBy: string | number, caseInsensitive: boolean);

    /**
    * Return if array contain duplicate values
    * @return { boolean }
    */
    containsDuplicatedValues(): boolean;

    /**
    * Removed duplicates from arrays
    * @return { array }
    */
    unique(prop?: string): any[];

    /**
    * Inserts element in array at given index
    * @return { array }
    */
    insert(index: number, item: T): T[];

    /**
    * @param conditionCallback - checks if the array element matches
    *
    * @return the first occurence of an element in a collection,
    *         passing the given condition check
    */
    first(conditionCallback: (element: T, index?: number) => boolean): T;

    isEmpty(): boolean;

    removeItem(item: T): void;

    contains(item: T): boolean;
}
