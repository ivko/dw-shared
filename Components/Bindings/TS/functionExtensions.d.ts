// ko.subscribable.fn
// interface KnockoutSubscribableFunctions<T> {
// }

// ko.observable.fn
// interface KnockoutObservableFunctions<T> {
// }

// ko.computed.fn
// interface KnockoutComputedFunctions<T> {
// }

// ko.observableArray.fn
interface KnockoutObservableArrayFunctions<T> {
    /**
    * Tracks when observable array is updated
    */
    trackHasItems(): KnockoutObservableArray<T>,

    /**
    * Shows if there are no items in the collection
    */
    isEmpty(): boolean,

    /**
    */
    move(arguments: any):  T[] | any
}

