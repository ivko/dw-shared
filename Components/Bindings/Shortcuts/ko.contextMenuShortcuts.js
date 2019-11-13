(function ($, ko) {

    var ContextMenuShortcutsBindingHandler = new Class({
        Extends: DW.BindingHandler.ShortcutsBindingHandler,
        init: function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
            var options = ko.utils.unwrapObservable(valueAccessor()),
                $menu = ko.bindingHandlers.contextMenu.getWidget(element),
                $shortcuts = $(element).closest('.shortcuts'),
                owner = element,
                shortcuts = {},
                enable = function () { return true; },
                registerShortcuts = function () {
                    DW.ShortcutsDispatcher.getInstance().register(shortcutsBundle);
                },
                self = this;

            if ($shortcuts.length) {
                owner = $shortcuts.get(0);
                enable = this.active(owner);
            }

            for (var key in options.shortcuts) {

                shortcuts[key] = function () {
                    if (!$(owner).is(":visible")) return;

                    var customPosition = null;
                    //add position if positionAtElement context menu options is false and a custom position must be set for showing the menu
                    if (options.position) {
                        var pos = $(owner).find(options.position.selector).get(0);
                        if (!pos) return;

                        customPosition = {
                            at: options.position.at,
                            of: pos
                        };
                    }

                    $menu.contextMenu(options.shortcuts[key], {
                        preventDefault: function () { },
                        stopPropagation: function () { }
                    }, customPosition);
                };
            }
            var shortcutsBundle = {
                shortcuts: shortcuts,
                bindingContext: null
            };

            var enabled = ko.computed(function () {
                if (enable()) self._addShortcuts(owner, shortcutsBundle, registerShortcuts);
                else {
                    self._removeShortcuts(owner, shortcutsBundle, registerShortcuts);
                }
            });

            ko.utils.domNodeDisposal.addDisposeCallback(element, function () {
                if (enabled) enabled.dispose();
                self._removeShortcuts(owner, shortcutsBundle, registerShortcuts);
            });
        }
    });

    $.extend(ns('DW.BindingHandler'), {
        ContextMenuShortcutsBindingHandler: ContextMenuShortcutsBindingHandler
    });

    ko.bindingHandlers.contextMenuShortcuts = new ContextMenuShortcutsBindingHandler();

}).call(this, jQuery, ko);