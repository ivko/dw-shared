import {Deferred} from "./deferred";
var slice = [].slice;

export function When<T>(...deferreds: Array<JQueryDeferred<T>/* as JQueryDeferred<T> */>): JQueryPromise<T>{
    var i = 0,
        length = deferreds.length,
        subordinate = deferreds[0],

        // the count of uncompleted subordinates
        remaining = length !== 1 ||
            (subordinate && $.isFunction(subordinate.promise)) ? length : 0,

        // the master Deferred.
        // If deferreds consist of only a single Deferred, just use that.
        deferred = remaining === 1 ? subordinate : Deferred<T>(),

        // Update function for both resolve and progress values
        updateFunc = function (i, contexts, values) {
            return function (value) {
                contexts[i] = this;
                values[i] = arguments.length > 1 ? slice.call(arguments) : value;
                if (values === progressValues) {
                    deferred.notifyWith(contexts, values);
                } else if (!(--remaining)) {
                    deferred.resolveWith(contexts, values);
                }
            };
        },

        progressValues, progressContexts, resolveContexts;

    // Add listeners to Deferred subordinates; treat others as resolved
    if (length > 1) {
        progressValues = new Array(length);
        progressContexts = new Array(length);
        resolveContexts = new Array(length);
        for (; i < length; i++) {
            if (deferreds[i] && $.isFunction(deferreds[i].promise)) {
                deferreds[i].promise()
                    .progress(updateFunc(i, progressContexts, progressValues))
                    .done(updateFunc(i, resolveContexts, deferreds))
                    .fail(deferred.reject);
            } else {
                --remaining;
            }
        }
    }

    // If we're not waiting on anything, resolve the master
    if (!remaining) {
        deferred.resolveWith(resolveContexts);
    }

    return deferred.promise();
};
