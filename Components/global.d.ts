
interface Array<T> {
    /**
      * Returns first element of an array that meet the condition specified in a callback function. 
      * @param predicate A function that accepts up to three arguments. The find method calls the predicate function one time for each element in the array until an item satisfies the predicate.
      * @param thisArg An object to which the this keyword can refer in the callbackfn function. If thisArg is omitted, undefined is used as the this value.
      */
    find(predicate: (value: T, index: number, array: T[]) => boolean): T;


    /**
      * Returns an array of elements that meet the conditions specified in both callback functions. 
      * @param filterPredicate A function that accepts up to three arguments. The filter method calls the callbackfn function one time for each element in the array.
      * @param mapPredicate A function that accepts up to three arguments. The map method calls the callbackfn function one time for each element in the array.
      * @param thisArg An object to which the this keyword can refer in the callbackfn function. If thisArg is omitted, undefined is used as the this value.
      */
    filterMap<U>(filterPredicate: (value: T, index: number, array: T[]) => boolean, mapPredicate: (value: T, index: number, array: T[]) => U): U[]
}