(function (factory) {
    if (typeof define === "function" && define.amd) { // AMD.
        define(["jquery", "knockout", "./jquery.ui.popover", "../../../Bindings/koJquiBindingFactory"], factory);
    } else { // Global
        factory(jQuery, ko);
    }
}(function ($, ko) {

    ko.jqui.bindingFactory.create({
        name: 'popover',
        options: [
            'offset',
            'placement',
            'position',
            'container',
            'trigger',
            'cssClass',
            'delay',
            'multi',
            'arrow',
            'title',
            'content',
            'closeable',
            'template',
            'show',
            'hide'
        ],
        callableOptions: ['content'],
        events: ['open', 'close'],
        updateBindingHandler: function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
            var options = valueAccessor();
            if (typeof options.manualTrigger !== "undefined") {
                var value = ko.utils.unwrapObservable(options.manualTrigger);
                $(element).popover(value ? 'open' : 'close');
            }
        },
        postInit: function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {

            /// <summary>Keeps the isOpen binding property in sync with the popover's state.
            /// </summary>
            /// <param name='element' type='DOMNode'></param>
            /// <param name='valueAccessor' type='Function'></param>

            var value = valueAccessor();
            var content = false;
            if (value.templateName && value.viewModel) {
                $(element).popover({
                    content: function () {
                        content = DW.Utils.renderTemplate(value.templateName, value.viewModel)
                        return content;
                    }
                });
            }

            if (value.isOpen) {
                ko.computed({
                    read: function () {
                        if (ko.utils.unwrapObservable(value.isOpen)) {
                            $(element).popover.delay(0, $(element), ['open']);
                        } else {
                            $(element).popover.delay(0, $(element), ['close']);
                        }
                    },
                    disposeWhenNodeIsRemoved: element
                });
            }

            if (ko.isWriteableObservable(value.isOpen)) {
                $(element).on('popoveropen.ko', function () {
                    value.isOpen(true);
                });
                $(element).on('popoverclose.ko', function () {
                    value.isOpen(false);
                });
            }

            //handle disposal
            ko.utils.domNodeDisposal.addDisposeCallback(element, function () {
                if (content) {
                    content.remove();
                }
                $(element).off('.ko');
            });

            $(element).on('dwResize.ko', function (event) {
                $(element).popover('refresh');
            });
        },
        controlsDescendantBindings: false,
        hasRefresh: true
    });

    ko.bindingHandlers.popoverHint = {
        init: ko.bindingHandlers.popover.init,
        update: function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {

            var options = valueAccessor(),
                persistState = DW.PersistFactory.getPersistState('popoverHint'),
                isDisplayed = persistState.loadItem(options.uniqueKey, false),
                isTriggered = ko.utils.unwrapObservable(options.manualTrigger);

            options.manualTrigger = !isDisplayed && isTriggered;

            ko.bindingHandlers.popover.update(element, function () { return options }, allBindingsAccessor, viewModel, bindingContext);

            if (options.manualTrigger === true) {
                // mark as displayed
                persistState.updateItem(options.uniqueKey, true);
                // attach event handler to hide on pointer down.
                $(document.body).on('pointerdown.popoverHint', function () {
                    // hide it
                    $(element).popover('close');
                    // remove event handler
                    $(document.body).off('pointerdown.popoverHint');
                });
            }
        }
    }
}));