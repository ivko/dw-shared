(function (factory) {
    if (typeof define === "function" && define.amd) { // AMD.
        define(['jquery', './global'], factory);
    } else { // Global
        factory(jQuery);
    }
}(function ($) {

    if (typeof window.DW === 'undefined') window.DW = {};

    var slice = [].slice,
        tuples = [
        // action, add listener, callbacks,
        // ... .then handlers, argument index, [final state]
        ["notify", "progress", jQuery.Callbacks("memory"),
            jQuery.Callbacks("memory"), 2],
        ["resolve", "done", jQuery.Callbacks("once memory"),
            jQuery.Callbacks("once memory"), 0, "resolved"],
        ["reject", "fail", jQuery.Callbacks("once memory"),
            jQuery.Callbacks("once memory"), 1, "rejected"]
    ];

    var Deferred = function (func) {
        var deferred = $.Deferred(),
            thenCallback = function () {

                var fns = arguments;

                return Deferred(function (newDefer) {
                    $.each(tuples, function (i, tuple) {

                        // Map tuples (progress, done, fail) to arguments (done, fail, progress)
                        var fn = $.isFunction(fns[tuple[4]]) && fns[tuple[4]];

                        // deferred.progress(function() { bind to newDefer or newDefer.notify })
                        // deferred.done(function() { bind to newDefer or newDefer.resolve })
                        // deferred.fail(function() { bind to newDefer or newDefer.reject })
                        deferred[tuple[1]](function () {
                            var returned = fn && fn.apply(this, arguments);
                            if (returned && $.isFunction(returned.promise)) {
                                returned.promise()
                                    .progress(newDefer.notify)
                                    .done(newDefer.resolve)
                                    .fail(newDefer.reject);
                            } else {
                                newDefer[tuple[0] + "With"](
                                    this,
                                    fn ? [returned] : arguments
                                );
                            }
                        });
                    });
                    fns = null;
                }).promise();
            },
            promise = $.extend(deferred.promise(), {
                then: thenCallback
            });

        $.extend(deferred, {
            then: thenCallback,
            promise: function () {
                return promise;
            }
        });

        if (func) {
            func.call(deferred, deferred);
        }

        return deferred;
    };

    var When = function (subordinate /* , ..., subordinateN */) {
        var i = 0,
            resolveValues = slice.call(arguments),
            length = resolveValues.length,

            // the count of uncompleted subordinates
            remaining = length !== 1 ||
                (subordinate && $.isFunction(subordinate.promise)) ? length : 0,

            // the master Deferred.
            // If resolveValues consist of only a single Deferred, just use that.
            deferred = remaining === 1 ? subordinate : Deferred(),

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
                if (resolveValues[i] && $.isFunction(resolveValues[i].promise)) {
                    resolveValues[i].promise()
                        .progress(updateFunc(i, progressContexts, progressValues))
                        .done(updateFunc(i, resolveContexts, resolveValues))
                        .fail(deferred.reject);
                } else {
                    --remaining;
                }
            }
        }

        // If we're not waiting on anything, resolve the master
        if (!remaining) {
            deferred.resolveWith(resolveContexts, resolveValues);
        }

        return deferred.promise();
    };

    extend(window.DW, {
        When: When,
        Deferred: Deferred
    });
}));