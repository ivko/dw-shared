(function (factory) {
    if (typeof define === "function" && define.amd) { // AMD.
        define(["jquery", "knockout", "./jquery.ui.dwScrollbar", "../../../ko.updateTiggers"], factory);
    } else { // Global
        factory(jQuery, ko);
    }
}(function ($, ko) {
    //Attach dwScrollbar plugin to the specifeid element
    ko.bindingHandlers.dwScrollbar = {
        init: function (element, valueAccessor, allBindingsAccessor) {
            var $element = $(element),
                options = ko.utils.unwrapObservable(valueAccessor()),
                callback = $.proxy(function() {
                    if (this.is(":dw-dwScrollbar")) {
                        this.dwScrollbar("update");
                    }
                }, $element),
                timeoutId = null,
                resizeHandler = function () {
                    clearTimeout(timeoutId);
                    timeoutId = setTimeout(callback, 1);
                },
                updateTriggers = [],
                scrollContent = $element.find(options.contentSelector),
                scrollOptions = $.extend({
                    autoAdjustContentPadding: true,
                    scrollContent: options.contentSelector === false ? false : (scrollContent.length > 0 ? options.contentSelector : null)
                }, options.options);

            if (scrollOptions.updateTriggers) {
                updateTriggers = ko.updateTriggers(scrollOptions.updateTriggers, resizeHandler);
            }
            $element.dwScrollbar(scrollOptions).on('dwResize', resizeHandler);

            //clean up
            ko.utils.domNodeDisposal.addDisposeCallback(element, function (element) {
                DW.Utils.dispose(updateTriggers);
                var $element = $(element);
                $element.off('dwResize', resizeHandler);
                if ($element.is(":dw-dwScrollbar")) {
                    $element.dwScrollbar("destroy");
                }
            });
        }
    };
}));