import * as $ from "jquery";
declare global {
    interface JQueryDeferred<T> {
        promise(target?: any): JQueryPromise<T>;
    }
}
let tuples: any[] = [
    // action, add listener, callbacks,
    // ... .then handlers, argument index, [final state]
    ["notify", "progress", $.Callbacks("memory"),
        $.Callbacks("memory"), 2],
    ["resolve", "done", $.Callbacks("once memory"),
        $.Callbacks("once memory"), 0, "resolved"],
    ["reject", "fail", $.Callbacks("once memory"),
        $.Callbacks("once memory"), 1, "rejected"]
];

export function Deferred<T>(beforeStart?: (deferred: JQueryDeferred<T>) => any): JQueryDeferred<T> {
    let deferred:JQueryDeferred<T> = $.Deferred(),
        thenCallback = function () {

            var fns = arguments;

            return Deferred<T>(function (newDefer) {
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

    if (beforeStart) {
        beforeStart.call(deferred, deferred);
    }

    return deferred;
};