(function (factory) {
    if (typeof define === "function" && define.amd) { // AMD.
        define(["jquery", "knockout", "../utils", "./BindingHandler"], factory);
    } else { // Global
        factory(jQuery, ko);
    }
}(function ($, ko) {

    $.extend(ko.utils, {
        resolveRequires: function (bindingContext, requires) {
            /// <summary>
            ///     For each defined predicate in command requires object, traverses the current binding context and its parents.
            /// </summary>
            /// <param name="bindingContext">bindingContext from the custom command binding</param>
            /// <param name="requires">{{key: predicate function}, ..} defined in the command</param>
            /// <returns>Object that for each defined predicate in the command returns the context for which the predicate is valid</returns>
            var rqs = {}, rqKey, rqFun, rq;
            requires = requires || {};
            if (bindingContext) {
                for (rqKey in requires) {
                    rqFun = requires[rqKey];
                    rq = null;
                    [].concat(bindingContext.$data || [], bindingContext.$parents || []).some(function (vm) {
                        if ($.isFunction(rqFun)) {
                            rqFun = {
                                predicate: rqFun,
                                useReturnValue: false
                            };
                        }

                        var rqValue = rqFun.predicate.call(null, vm);
                        if (!!rqFun.useReturnValue) {
                            if (rqValue !== void 0) { // undefined
                                rq = rqValue;
                                return true; // break
                            }
                        } else {
                            if (!!rqValue) {
                                rq = vm;
                                return true; // break
                            }
                        }
                    });
                    rqs[rqKey] = rq;
                }
            }
            return rqs;
        },
        wrapAccessor: function (accessor) {
            return function () {
                return accessor;
            };
        },
        isBindingHandler: function (handler) {
            return ko.bindingHandlers[handler] !== void 0;
        }
    });

    $.extend(ko.extenders, {
        "booleanValue": function (target) {
            target.formattedValue = ko.computed({
                read: function () {
                    return String(target());
                },
                write: function (newValue) {
                    target(String.from(newValue).toBoolean());
                }
            });

            target.formattedValue(target());
            return target;
        },
        "async3": function (target, base) {
            var result = ko.observable(base),
                wait = null,
                handle = function (promise) {
                    if (wait) {
                        wait.reject();
                        wait = null;
                    }

                    if (promise && typeof promise.then == "function") {
                        result(base);
                        wait = DW.Deferred(function (t) {
                            promise.then(function (data) {
                                t.resolve(data);
                            });
                        });
                        wait.then(function (data) {
                            result(data);
                            wait = null;
                        });
                    } else {
                        result(promise);
                    }
                },
                subs = target.subscribe(handle);

            handle(target());

            result.dispose = function () {
                if (wait) {
                    wait.reject();
                    wait = null;
                }
                subs.dispose();
            };

            return result;
        }
    });


    ko.observableArray.fn.trackHasItems = function () {
        //create a sub-observable
        this.hasItems = ko.observable(false);
        this.hasSingleItem = ko.observable(false);

        //update it when the observableArray is updated
        var subscription = this.subscribe(function (newValue) {
            this.hasItems(newValue && newValue.length > 0 ? true : false);
            this.hasSingleItem(newValue && newValue.length == 1 ? true : false);
        }, this);

        //trigger change to initialize the value
        this.valueHasMutated();

        this.dispose = function () {
            DW.Utils.dispose(subscription);
        };
        //support chaining by returning the array
        return this;
    };

    ko.observableArray.fn.isEmpty = function () {
        var hasItems = this.hasItems;
        if (hasItems) {
            hasItems = hasItems();
        } else {
            //trackSelection has not be called on the object => apply default behaviour
            hasItems = !this().isEmpty();
        }
        return !hasItems;
    };

    ko.observableArray.fn.move = function () {
        // Use "peek" to avoid creating a subscription in any computed that we're executing in the context of
        // (for consistency with mutating regular observables)
        var underlyingArray = this.peek();
        this.valueWillMutate();
        var methodCallResult = underlyingArray.move.apply(underlyingArray, arguments);
        this.valueHasMutated();
        return methodCallResult;
    };

    $.extend(ko.bindingHandlers['foreach'], {
        makeTemplateValueAccessor: function (valueAccessor) {
            return function () {
                var modelValue = valueAccessor(),
                    unwrappedValue = ko.utils.peekObservable(modelValue);    // Unwrap without setting a dependency here

                // If unwrappedValue is the array, pass in the wrapped value on its own
                // The value will be unwrapped and tracked within the template binding
                // (See https://github.com/SteveSanderson/knockout/issues/523)
                if ((!unwrappedValue) || typeof unwrappedValue.length == "number")
                    return { 'foreach': modelValue, 'templateEngine': ko.nativeTemplateEngine.instance };

                // If unwrappedValue.data is the array, preserve all relevant options and unwrap again value so we get updates
                ko.utils.unwrapObservable(modelValue);
                return {
                    'foreach': unwrappedValue['data'],
                    'as': unwrappedValue['as'],
                    'includeDestroyed': unwrappedValue['includeDestroyed'],
                    'afterAdd': unwrappedValue['afterAdd'],
                    'beforeRemove': unwrappedValue['beforeRemove'],
                    'afterRender': unwrappedValue['afterRender'],
                    'beforeMove': unwrappedValue['beforeMove'],
                    'afterMove': unwrappedValue['afterMove'],
                    'templateEngine': unwrappedValue['templateEngine'] ? unwrappedValue['templateEngine'] : ko.nativeTemplateEngine.instance
                };
            };
        },
        init: function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
            return ko.bindingHandlers.template.init(element, ko.bindingHandlers.foreach.makeTemplateValueAccessor(valueAccessor));
        },
        update: function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
            return ko.bindingHandlers.template.update(element, ko.bindingHandlers.foreach.makeTemplateValueAccessor(valueAccessor), allBindingsAccessor, viewModel, bindingContext);
        }
    });

    ko.unapplyBindings = function ($node, shouldRemove) {

        // unbind events
        $node.find("*").each(function () {
            $(this).off();
        });

        if (shouldRemove) {
            ko.removeNode($node[0]);
        } else {
            ko.cleanNode($node[0]);
        }
    };

    Object.append(ko.bindingHandlers, Object.map({
        returnKey: 13,
        escKey: 27
    }, function (keyCode) {
        return {
            init: function (element, valueAccessor, allBindingsAccessor, viewModel) {
                var options = $.extend({
                    onKey: function (evt, args) {
                        evt.target.blur();
                    }
                }, ko.utils.unwrapObservable(allBindingsAccessor().keyOptions) || {});
                ko.utils.registerEventHandler(element, 'keydown', function (evt) {
                    if (evt.keyCode === keyCode) {
                        evt.preventDefault();
                        evt.stopPropagation();
                        options.onKey(evt);
                        valueAccessor().call(viewModel);
                    }
                });
            }
        };
        }));
}));