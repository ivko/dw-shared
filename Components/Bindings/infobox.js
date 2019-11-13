(function (factory) {
    if (typeof define === "function" && define.amd) { // AMD.
        define(['jquery', 'knockout', '../global', '../Widgets/popover/Scripts/ko.popover'], factory);
    } else { // Global
        factory(jQuery, ko);
    }
}(function ($, ko) {

    ko.bindingHandlers.infobox = {
        init: function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {

            var bindingValue = ko.utils.unwrapObservable(valueAccessor()),
                options = $.extend(true, {
                    key: '',
                    templateName: false,
                    viewModel: false,
                    localize: $R,
                    options: {
                        placement: function (context, source) { // API for position - (called on every popover call)
                            return function () {
                                if ($(element).offset().top > ($(document).height() / 2)) {
                                    return "top";
                                }
                                else {
                                    return "bottom";
                                }
                            };
                        },
                        title: false,
                        container: 'body',
                        trigger: 'hover',
                        delay: 600
                    }
                }, $.type(bindingValue) === 'string' ? {
                    key: bindingValue
                } : bindingValue),
                info_key = options.key + '_Infobox_Content',
                title_key = options.key + '_Infobox_Title',
                content = options.localize(info_key),
                title = options.localize(title_key),
                $element = $(element);

            if (info_key === content) {
                $(element).hide();
                return;
            }

            if (title_key === title) {
                title = '';
            }

            $.extend(options.options, {
                content: content,
                title: title
            });

            $element.data('ko.infobox.options', options);

            $element.on('popoveropen.infobox', function (event, ui) {
                var api = ui.popover.data('popover-api');
                
                ui.popover.one('mouseenter.infobox', function () {

                    clearTimeout(api._timeout);
                    ui.popover.one('mouseleave.infobox', function () {
                        api.close();
                        ui.popover.off('mouseenter.infobox mouseleave.infobox');
                    });
                });

                $element.one('popoverclose.infobox', function (event, ui) {
                    $(document).trigger('infoboxclose', { api: api, key: options.key });
                });

                $(document).trigger('infoboxopen', { api: api, key: options.key });
            });

            ko.utils.domNodeDisposal.addDisposeCallback(element, function () {
                $element.off('popoveropen.infobox');
            });
            
            return ko.bindingHandlers.popover.init(element, function () { return options.options }, allBindingsAccessor, viewModel, bindingContext);
        },
        update: function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
            var options = $(element).data('ko.infobox.options');
            if (!options) {
                return;
            }
            ko.bindingHandlers.popover.update(element, function () { return options.options }, allBindingsAccessor, viewModel, bindingContext)
        }
    };

    var InfoboxUsageTracker = new Class({
        trackTimeout: 1000,
        initialize: function (trackingService, properties) {
            this.trackingService = trackingService;
            this.properties = properties;

            $(document).on({
                'infoboxopen': this.handleOpen.bind(this),
                'infoboxclose': this.handleClose.bind(this)
            });
        },
        handleOpen: function (event, ui) {
            ui.api.$popover.find('a').on('click.infoboxusagetracker', this.handleClick.bind(this, ui));
            ui.api.$popover.trackTimeoutId = setTimeout(this.trackOpen.bind(this, ui), this.trackTimeout);
        },
        handleClose: function (event, ui) {
            clearTimeout(ui.api.$popover.trackTimeoutId);
            ui.api.$popover.find('a').off('.infoboxusagetracker');
        },
        handleClick: function (ui) {
            this.trackClick(ui);
        },
        trackOpen: function (ui) {
            if (ui.api.element.trackOpenSent) return;
            ui.api.element.trackOpenSent = true;
            
            var properties = $.extend({
                operation: 'InfoboxOpen',
                description: 'Infobox opened',
                key: ui.key,
                title: ui.api.$popover.find('.title').text(),
            }, this.properties),
                measurements = {};

            this.trackingService.trackEvent('InfoboxUsage', properties, measurements);
        },
        trackClick: function (ui) {
            if (ui.api.element.trackClcikSent) return;
            ui.api.element.trackClcikSent = true;
            
            var properties = $.extend({
                operation: 'InfoboxLinkClick',
                description: 'Infobox opened, link followed',
                key: ui.key,
                title: ui.api.$popover.find('.title').text(),
                url: ui.api.$popover.find('.content a').attr('href')
            }, this.properties),
                measurements = {};
            
            this.trackingService.trackEvent('InfoboxUsage', properties, measurements);
        }
    });

    extend(ns('DW'), {
        InfoboxUsageTracker: InfoboxUsageTracker
    });

}));
