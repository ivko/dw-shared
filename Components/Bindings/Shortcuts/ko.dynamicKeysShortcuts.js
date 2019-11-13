(function ($, ko) {

    function wrapAccessor(accessor) {
        return function () {
            return accessor;
        };
    };

    var DynamicKeysShortcuts = new Class({
        Extends: DW.BindingHandler.ShortcutsBindingHandler,
        init: function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
            var dynamicKeys = ko.utils.unwrapObservable(valueAccessor()),
                commands = dynamicKeys.commands,
                getKey = dynamicKeys.getKey,
                buildShortcutsBundle = function (offset) {
                    return {
                        shortcuts: commands.reduce(function (m, cmd, index) {
                            m[getKey(offset, index)] = commands[index];
                            return m;
                        }, {}),
                        bindingContext: bindingContext
                    };
                },
                shortcutsBundle = buildShortcutsBundle(dynamicKeys.update()),
                updateSubscription = dynamicKeys.update.subscribe(function (newValue) {
                    DW.ShortcutsDispatcher.getInstance().unregister(shortcutsBundle);
                    shortcutsBundle = $.extend(shortcutsBundle, buildShortcutsBundle(newValue));
                    DW.ShortcutsDispatcher.getInstance().register(shortcutsBundle);
                }.bind(this));

            this.parent(element,
                wrapAccessor(function () { return true; }),
                wrapAccessor({ shortcutOptions: { global: {}, shortcutsBundle: shortcutsBundle } }),
                viewModel,
                bindingContext);

            ko.utils.domNodeDisposal.addDisposeCallback(element, function () {
                if (updateSubscription) updateSubscription.dispose();
            });
        }
    });

    $.extend(ns('DW.BindingHandler'), {
        DynamicKeysShortcuts: DynamicKeysShortcuts
    });

    ko.bindingHandlers.dynamicKeysShortcuts = new DynamicKeysShortcuts();

}).call(this, jQuery, ko);