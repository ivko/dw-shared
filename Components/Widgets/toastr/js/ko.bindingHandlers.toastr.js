(function( factory ) {
    if ( typeof define === "function" && define.amd ) {
        define(["jquery", "knockout", "./toastr"], factory);
    } else {
        factory(jQuery, ko);
    }
}(function ($, ko) {
    ko.bindingHandlers.toastr = {
        init: function (element, valueAccessor, allBindingsAccessor) {
            //This approach save us from the check for already initiated component
            var $element = $(element);

            var notify = valueAccessor();
            var allBindings = allBindingsAccessor();
            var subscription = null;
            var toastrElement = null;

            if (ko.isObservable(notify)) {            
                subscription = notify.subscribe(function (args) {

                    var toastrOptions = $.extend({
                        container: args.scope === toastrScope.local ? $element : undefined
                    }, args.options || {},
                    allBindings && allBindings.notifyOptions);

                    if (args) {
                        toastrElement = null;
                        switch (args.type) {
                            case toastrTypes.error:
                                //use of a shared handler that requires different error interface
                                args.message = args.responseText ? args.responseText : args.message;
                                args.statusCode = args.errorCode;
                                DW.Utils.handleError(args, {
                                    show: function (message, html) {
                                        toastrElement = toastr.error(args.title, message, toastrOptions);
                                    }
                                });
                                //DW.Utils.handleError(args, { toastrOptions: toastrOptions });
                                //toastrElement = toastr.error(args.title, args.message, toastrOptions);
                                break;
                            case toastrTypes.errorUnsafe:
                                args.message = args.responseText ? args.responseText : args.message;
                                args.statusCode = args.errorCode;
                                DW.Utils.handleError(args, {
                                    show: function (message, html) {
                                        toastrElement = toastr.errorUnsafe(args.title, message, toastrOptions);
                                    },
                                    showHtmlMsg: true
                                });
                                //DW.Utils.handleError(args, {
                                //    toastrOptions: toastrOptions,
                                //    showHtmlMsg: true
                                //});
                                //toastrElement = toastr.errorUnsafe(args.title, args.message, toastrOptions);
                                break;
                            case toastrTypes.info:
                                toastrElement = toastr.info(args.title, args.message, toastrOptions);
                                break;
                            case toastrTypes.infoUnsafe:
                                toastrElement = toastr.infoUnsafe(args.title, args.message, toastrOptions);
                                break;
                            case toastrTypes.success:
                                toastrElement = toastr.success(args.title, args.message, toastrOptions);
                                break;
                            case toastrTypes.successUnsafe:
                                toastrElement = toastr.successUnsafe(args.title, args.message, toastrOptions);
                                break;
                            case toastrTypes.warning:
                                toastrElement = toastr.warning(args.title, args.message, toastrOptions);
                                break;
                            case toastrTypes.warningUnsafe:
                                toastrElement = toastr.warningUnsafe(args.title, args.message, toastrOptions);
                                break;
                            case toastrTypes.confirm:
                                //$.extend(toastrOptions, allBindings && allBindings.notifyOptions);
                                toastrElement = toastr.confirm(args.title, args.message, args.callback, toastrOptions);
                                break;
                            case toastrTypes.confirmUnsafe:
                                toastrElement = toastr.confirmUnsafe(args.title, args.message, args.callback, toastrOptions);
                            case toastrTypes.noIconUnsafe:
                                toastrElement = toastr.noIconUnsafe(args.title, args.message, toastrOptions);
                                break;
                            default:
                                break;
                        }
                        if (toastrElement) {
                            ko.bindingHandlers.toastr.register(args.type, toastrElement, toastrOptions);
                        }

                        //if (ko.isObservable(args.closeTrigger)) { 
                        //    closeSubscription = args.closeTrigger.subscribe(function (triggerValue) {
                        //        if (triggerValue && toastrElement) {
                        //            toastr.forceClose(toastrElement);
                        //            closeSubscription.dispose();
                        //        }
                        //    });
                        //}
                    }
                });
            }

            ko.utils.domNodeDisposal.addDisposeCallback(element, function () {
                if (subscription) {
                    subscription.dispose();
                }
            });
        },
        register: function (type, toastrElement, toastrOptions) {

            if (type === toastrTypes.confirm || type === toastrTypes.confirmUnsafe || toastrOptions.timeOut != 0) {
                return;
            }
            
            var registry = this.registry[type];

            if (typeof registry == "undefined") {
                return;
            }

            while (registry.length > 0) {
                var $element = registry.shift();
                toastr.forceClose($element);           
            }
            registry.push(toastrElement);
        },
        registry: {}
    };

    for (var typeKey in toastrTypes) {
        ko.bindingHandlers.toastr.registry[toastrTypes[typeKey]] = [];
    }
}));