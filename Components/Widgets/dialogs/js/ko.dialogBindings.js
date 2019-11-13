(function (factory) {
    if (typeof define === "function" && define.amd) {
        define(["jquery", "knockout", "./jquery.ui.dialog", "./Dialog"], factory);
    } else {
        factory(jQuery, ko);
    }
}(function ($, ko) {
    ko.bindingHandlers.dwDialog = {
        init: function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
            var dialogId = $(element).uniqueId().attr('id'),
                value = ko.utils.unwrapObservable(valueAccessor()),
                options = (typeof value.getOptions === "function" ? value.getOptions() : void 0) || {},
                model = (typeof value.getModel === "function" ? value.getModel() : void 0) || ko.observable(null),
                show = (typeof value.getShow === "function" ? value.getShow() : void 0) || ko.observable(false);

            var dialog = new DW.Dialog({
                id: dialogId,
                element: element,
                options: options
            });

            if (model()) {
                dialog.bind(model);
            }
            var modelSubscription = model.subscribe(function (value) {
                dialog.bind(model);
            });

            if (show()) {
                dialog.show();
            }
            var showSubscription = show.subscribe(function (value) {
                dialog[value ? 'open' : 'close']();
            });

            ko.utils.domNodeDisposal.addDisposeCallback(element, function () {
                // dispose the subscriptions
                modelSubscription.dispose();
                showSubscription.dispose();

                dialog.destroy();
            });
        }
    };

    //jQuery UI dialog
    ko.bindingHandlers.jqDialog = {
        init: function (element, valueAccessor) {
            var value = ko.utils.unwrapObservable(valueAccessor()) || {};

            var options = $.extend({
                autoOpen: false,
                resizable: false,
                modal: true,
                width: 480,
                height: 640,
            }, value);

            ko.utils.domNodeDisposal.addDisposeCallback(element, function () {
                $(element).dialog("destroy");
            });

            $(element).dialog(options);
        }
    };

    ko.bindingHandlers.openDialog = {
        update: function (element, valueAccessor) {
            var value = ko.utils.unwrapObservable(valueAccessor());

            $(element).dialog(value ? "open" : "close");
        }
    };

    //custom binding to initialize a jQuery UI dialog
    ko.bindingHandlers.wfjqDialog = {
        init: function (element, valueAccessor, allBindingsAccessor) {
            var options = ko.utils.unwrapObservable(valueAccessor()) || {};

            var model = options.model;

            var subscription = model.updateOptions.subscribe(function (value) {
                if (value) {
                    $(element).dialog("option", 'title', model.title());
                    $(element).dialog("option", 'height', model.openedWindow() == 1 ? 695 : 630);
                    if (model.openedWindow() == 3 || model.openedWindow() == 2 || model.openedWindow() == 4) {
                        $(".ui-dialog").addClass("settings-dialog");
                    }
                    else {
                        $(".ui-dialog").removeClass("settings-dialog");
                    }
                    model.updateOptions(false);
                }
            });

            options = $.extend({
                autoOpen: false,
                resizable: false,
                modal: true,
                height: model.openedWindow() == 1 ? 695 : 630,
                open: function () {

                },
                show: false
            }, options);
            //handle disposal
            ko.utils.domNodeDisposal.addDisposeCallback(element, function () {
                subscription.dispose();
                $(element).dialog("destroy");
            });

            $(element).dialog(options);

            $(".ui-dialog").addClass("dw-dialogs");
            if (model.openedWindow() == 3 || model.openedWindow() == 2 || model.openedWindow() == 4) {//history windows opened by result list, workflow tab, request 
                $(".ui-dialog").addClass("settings-dialog");
            }
        }

    };


    //Fix dialog height after load
    ko.bindingHandlers.fixedDialogHeight = {
        init: function (element, valueAccessor, allBindingsAccessor) {
            var $element = $(element);

            setTimeout(function () {
                var elementHeight = element.clientHeight;
                $(element).height(elementHeight);
            }, 0);
        }
    };
}));