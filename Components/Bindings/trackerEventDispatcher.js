(function (factory) {
    if (typeof define === "function" && define.amd) { // AMD.
        define(['jquery', 'knockout', 'bootstrap'], factory);
    } else { // Global
        factory(jQuery, ko);
    }
}(function ($, ko) {
    // options interface
    // areaName - from where is the event coming
    // actionName - what is the event (what was done)
    ko.bindingHandlers.trackerEventDispatcher = {
        init: function (element, options, allBindingsAccessor, viewModel, bindingContext) {
            var $el = $(element);
            options = options();
            var areaName="";
            if (typeof options.areaName === 'function') {
                [].concat(bindingContext.$data, bindingContext.$parents).slice(0, 5).find(function(cntxt) {
                    var res = options.areaName(cntxt);
                    if (!!res) {
                        areaName = res;
                        return true;
                    }
                });
            } else {
                areaName = options.areaName;
            }

            $el.on("click.trackerEventDispatcher", DW.Utils.throttle(function (event) {
                var $trackedItem = $(event.target).closest("[data-trackerevent]");
                if (!$trackedItem.length) return;
                var eventName = $trackedItem.data('trackerevent');
                if (eventName) {
                    DW.Tracker.fireSimpleEvent(options.actionName, {
                        Area: areaName,
                        ItemName: eventName
                    });
                }
            }, 300, { leading: true, trailing: false }));

            ko.utils.domNodeDisposal.addDisposeCallback(element, function (element) {
                $el.off(".trackerEventDispatcher");
            });
        }
    };
}));