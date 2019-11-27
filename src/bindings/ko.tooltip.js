(function (factory) {
    if (typeof define === "function" && define.amd) { // AMD.
        define(["jquery", "knockout", "./lazyBinding", "../ui/jquery.ui.tooltip", "./koJquiBindingFactory", "../ui/jquery.ui.tooltipConditions"], factory);
    } else { // Global
        factory(jQuery, ko);
    }
}(function ($, ko, lazyBinding) {

    // prepare arrayWithConditions, isOpen
    var prepareOptions = function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
        var $element = $(element),
            accessor = valueAccessor() || {},
            tempCondition = null;

        accessor.arrayWithConditions = [];

        // if pass 'content' as param in tooltip binding use default condition
        if (accessor.content) {
            accessor.arrayWithConditions.unshift(TooltipConditions.default(element, accessor.content));
        }
        // if pass array with condition(s)
        if (accessor.conditions) {
            accessor.conditions.forEach(function (condition) {
                if (typeof condition.type == 'string') {
                    accessor.arrayWithConditions.push(TooltipConditions[condition.type](element, condition.arg));
                }
            });
        }

        //check conditions for show observable
        accessor.arrayWithConditions.forEach(function (condition) {
            if (condition.show && ko.isObservable(condition.show)) {
                if (condition.show() === true) {
                    throw 'cannot initialize conditional tooltip with show = true';
                }
            } else {
                throw 'conditions must have show observable';
            }
        });

        // content must be observable in case we want to show diffrent text in tooltip
        // content value from the binding is stored in our arrayWithConditions -> default -> content
        accessor.content = ko.observable();

        // computed that is needed to open and close the tooltip -> isOpen-true/false
        // when event occurs and condition property 'show' is changed to 'true', show tooltip with its corresponding content
        accessor.isOpen = ko.computed({
            read: function () {
                if (tempCondition) {
                    tempCondition.show(false);
                }

                tempCondition = accessor.arrayWithConditions.filter(function (condition) { return condition.show(); }).shift();

                if (!tempCondition) return false;
                if (typeof tempCondition.content == 'function') {
                    var tempContent = tempCondition.content();
                    if (!tempContent) {
                        return;
                    }
                    accessor.content(tempContent.toString());
                } else {
                    if (!tempCondition.content) {
                        return;
                    }
                    accessor.content(tempCondition.content);
                }
                return true;
            },
            write: function (value) {
                if (tempCondition) {
                    tempCondition.show(value);
                }
            }
        });

        return accessor;
    };

    var postInit = function (element, valueAccessor) {
        /// <summary>Keeps the isOpen binding property in sync with the tooltip's state.
        /// </summary>
        /// <param name='element' type='DOMNode'></param>
        /// <param name='valueAccessor' type='Function'></param>

        var accessor = valueAccessor(),
            mutationObserver = createMutationObserver(closeOnDisabled);

        mutationObserver.observe(element, { attributes: true, attributeFilter: ['disabled'] });

        initConditions(accessor.arrayWithConditions);

        initIsOpenHandling(element, accessor);

        dispose(element, accessor, mutationObserver);
    };

    // data-bind="tooltip: { conditions: [{ type: '', arg: content1 }, { type: '', arg: content2 }], placement: 'bottom' }"
    // use type from ns TooltipConditions

    ko.bindingHandlers.tooltip = new lazyBinding.LazyBindingHandler(
        'tooltipsettings',
        'mouseover focus',
        ko.jqui.bindingFactory.createBindingHandlerInit({
            name: 'tooltip',
            options: [
                'content',
                'delay',
                'disabled',
                'hide',
                'items',
                'position',
                'show',
                'tooltipClass',
                'track',
                'placement',
                'offset'],
            events: ['create', 'open', 'close'],
            callableOptions: ['content'],
            prepareOptions: prepareOptions,
            postInit: postInit,
            controlsDescendantBindings: false
        }),
        lazyBinding.prepareAttachDebounced);

    var initIsOpenHandling = function (element, accessor) {
        if (accessor.isOpen) {
            ko.computed({
                read: function () {
                    if (ko.utils.unwrapObservable(accessor.isOpen)) {
                        $(element).tooltip('open');
                    } else {
                        $(element).tooltip('close');
                    }
                },
                disposeWhenNodeIsRemoved: element
            });

            if (ko.isWriteableObservable(accessor.isOpen)) {
                $(element).on('tooltipopen.ko', function () {
                    accessor.isOpen(true);
                });
                $(element).on('tooltipclose.ko', function () {
                    accessor.isOpen(false);
                });
            }
        }
    };

    var initConditions = function (array) {
        array.forEach(function (condition) { condition.init() });
    };

    var createMutationObserver = function (callback) {
        var MutationObserver = window.MutationObserver || window.WebKitMutationObserver || window.MozMutationObserver;
        return new MutationObserver(callback);
    };

    var closeOnDisabled = function (mutations) {
        for (var i = 0, mutation; mutation = mutations[i]; i++) {
            if (mutation.target.disabled) {
                $(mutation.target).tooltip('close');
            }
        }
    };

    var dispose = function (element, accessor, mutationObserver) {
        ko.utils.domNodeDisposal.addDisposeCallback(element, function () {
            mutationObserver.disconnect();
            accessor.arrayWithConditions.forEach(function (condition) { condition.dispose(); });
            accessor.isOpen.dispose();
            $(element).off('.ko');
        });
    };

}));